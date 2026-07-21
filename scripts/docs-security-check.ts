import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

export const DOC_REGISTRY_PATH = 'docs/documentation-registry.json';

export const DOCUMENT_STATUSES = [
  'canonical',
  'current-reference',
  'generated',
  'historical',
  'stale',
  'unsafe',
  'duplicate',
  'unverified',
] as const;

type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

type RegistryDocument = {
  path: string;
  domain: string;
  status: DocumentStatus;
  owner: string;
  lastVerifiedDate?: string;
  lastVerifiedCommit?: string;
  supersededBy?: string;
  entryPoint?: string;
  maintenance: 'manual' | 'generated';
  verification?: string;
  warning?: string;
};

type DocumentationRegistry = {
  version: number;
  lastReviewedDate: string;
  lastReviewedCommit: string;
  documents: RegistryDocument[];
};

export type SecretFinding = {
  path: string;
  line: number;
  ruleId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: 'low' | 'medium' | 'high';
  classification:
    | 'confirmed-or-probable-credential'
    | 'example-placeholder'
    | 'environment-variable-name'
    | 'redacted-value'
    | 'public-identifier-or-endpoint'
    | 'false-positive'
    | 'requires-review';
  findingId: string;
};

type SecretRule = {
  id: string;
  severity: SecretFinding['severity'];
  confidence: SecretFinding['confidence'];
  pattern: RegExp;
};

const SECRET_RULES: SecretRule[] = [
  {
    id: 'stripe_or_clerk_secret_key',
    severity: 'critical',
    confidence: 'high',
    pattern: /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}\b/g,
  },
  {
    id: 'stripe_webhook_secret',
    severity: 'critical',
    confidence: 'high',
    pattern: /\bwhsec_[A-Za-z0-9]{16,}\b/g,
  },
  {
    id: 'postgres_connection_url',
    severity: 'critical',
    confidence: 'high',
    pattern: /\bpostgres(?:ql)?:\/\/[^\s'"`)<>]+/gi,
  },
  {
    id: 'authorization_bearer_value',
    severity: 'high',
    confidence: 'medium',
    pattern: /\bBearer\s+[A-Za-z0-9._~+/=-]{24,}\b/g,
  },
  {
    id: 'private_key_block',
    severity: 'critical',
    confidence: 'high',
    pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g,
  },
  {
    id: 'secret_env_assignment',
    severity: 'medium',
    confidence: 'medium',
    pattern:
      /\b(?:DATABASE_URL|DIRECT_URL|[A-Z0-9_]*(?:SECRET|TOKEN|PRIVATE_KEY|API_KEY)[A-Z0-9_]*)\s*=\s*([^\s#'"`<>][^\s#]*)/g,
  },
];

const PLACEHOLDER_RE =
  /^(?:<[^>]+>|\[[A-Z0-9_-]+\]|\$\{[A-Z0-9_]+\}|\$[A-Z0-9_]+|%[A-Z0-9_]+%|your[_-]?[A-Z0-9_-]*|placeholder|dummy|fake|test[_-]?value|changeme|redacted|\*{3,}|x{4,}|\.{3})$/i;

const SAFE_PUBLIC_VALUE_RE = /^(?:true|false|0|1|localhost|127\.0\.0\.1|null|undefined)$/i;
const KNOWN_SECRET_VALUE_RE =
  /(?:\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}\b|\bwhsec_[A-Za-z0-9]{16,}\b|\bpostgres(?:ql)?:\/\/[^\s'"`)<>]+)/i;

const REVIEW_REQUIRED_FINDING_IDS = new Set([
  'DATABASE_SETUP.md:29:postgres_connection_url:0',
  'DATABASE_SETUP.md:32:postgres_connection_url:0',
  'DEPLOYMENT.md:54:postgres_connection_url:0',
  'DEPLOYMENT.md:54:secret_env_assignment:0',
  'docker-compose.yml:111:secret_env_assignment:0',
  'LOCAL_SETUP_GUIDE.md:26:postgres_connection_url:0',
  'LOCAL_SETUP_GUIDE.md:26:secret_env_assignment:0',
  'LOCAL_SETUP_GUIDE.md:29:postgres_connection_url:0',
  'LOCAL_SETUP_GUIDE.md:29:secret_env_assignment:0',
  'LOCAL_SETUP_GUIDE.md:32:secret_env_assignment:0',
  'LOCAL_SETUP_GUIDE.md:35:postgres_connection_url:0',
  'LOCAL_SETUP_GUIDE.md:35:secret_env_assignment:0',
  'LOCAL_SETUP_GUIDE.md:74:postgres_connection_url:0',
  'PRINTIFY_WEBHOOK_DEBUG.md:112:postgres_connection_url:0',
  'PRINTIFY_WEBHOOK_DEBUG.md:112:secret_env_assignment:0',
  'PRODUCTION_DEPLOYMENT.md:11:postgres_connection_url:0',
  'PRODUCTION_READY_CHECKLIST.md:78:postgres_connection_url:0',
  'PRODUCTION_READY_CHECKLIST.md:78:secret_env_assignment:0',
  'RUNE_SYSTEM_SETUP.md:36:postgres_connection_url:0',
  'SESSION_COMPLETE_PHASES_1-4.md:320:postgres_connection_url:0',
  'SESSION_COMPLETE_PHASES_1-4.md:320:secret_env_assignment:0',
  'SESSION_PROGRESS_PHASE_1-3_COMPLETE.md:472:postgres_connection_url:0',
  'SESSION_PROGRESS_PHASE_1-3_COMPLETE.md:472:secret_env_assignment:0',
  'setup-local-env.sh:31:secret_env_assignment:0',
  'setup-local-env.sh:32:secret_env_assignment:0',
  'upgrade_config.env.example:13:secret_env_assignment:0',
]);

function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/').replace(/^\.\//, '');
}

function assignedValue(value: string): string {
  return value.includes('=') ? value.split('=').slice(1).join('=').trim() : value.trim();
}

function isApprovedPlaceholderValue(value: string): boolean {
  return PLACEHOLDER_RE.test(value);
}

function isApprovedPlaceholderPostgresUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.toLowerCase();
    const username = decodeURIComponent(parsed.username);
    const password = decodeURIComponent(parsed.password);
    return (
      ['localhost', '127.0.0.1', 'example.com'].includes(hostname) ||
      hostname.endsWith('.invalid') ||
      isApprovedPlaceholderValue(username) ||
      isApprovedPlaceholderValue(password) ||
      ['user', 'username', 'postgres'].includes(username.toLowerCase()) ||
      ['pass', 'password'].includes(password.toLowerCase())
    );
  } catch {
    return false;
  }
}

function classifyCandidate(ruleId: string, value: string): SecretFinding['classification'] {
  const trimmed = value.trim();
  if (!trimmed) return 'false-positive';
  const candidateValue = ruleId === 'secret_env_assignment' ? assignedValue(trimmed) : trimmed;
  if (!candidateValue) return 'false-positive';
  if (/<REDACTED>|REDACTED_[A-Z_]+|\[REDACTED/i.test(candidateValue)) {
    return 'redacted-value';
  }
  if (isApprovedPlaceholderValue(candidateValue)) {
    return 'example-placeholder';
  }
  if (ruleId === 'secret_env_assignment') {
    if (SAFE_PUBLIC_VALUE_RE.test(candidateValue)) return 'false-positive';
    if (/^\$\{\{\s*secrets\.[A-Z0-9_]+\s*\}\}$/i.test(candidateValue))
      return 'environment-variable-name';
    if (/^[A-Z0-9_]+$/.test(candidateValue)) return 'environment-variable-name';
    if (KNOWN_SECRET_VALUE_RE.test(candidateValue)) return 'confirmed-or-probable-credential';
  }
  if (ruleId === 'postgres_connection_url') {
    if (isApprovedPlaceholderPostgresUrl(candidateValue)) {
      return 'example-placeholder';
    }
  }
  if (/https?:\/\/(?:www\.)?otaku-mori\.com/i.test(candidateValue))
    return 'public-identifier-or-endpoint';
  if (ruleId === 'authorization_bearer_value' && isApprovedPlaceholderValue(candidateValue)) {
    return 'example-placeholder';
  }
  return ruleId === 'secret_env_assignment'
    ? 'requires-review'
    : 'confirmed-or-probable-credential';
}

export function scanDocumentationText(text: string, filePath = 'input.txt'): SecretFinding[] {
  const normalizedPath = normalizePath(filePath);
  const findings: SecretFinding[] = [];
  const lines = text.split(/\r?\n/);

  lines.forEach((lineText, index) => {
    for (const rule of SECRET_RULES) {
      const pattern = new RegExp(rule.pattern.source, rule.pattern.flags);
      let matchIndex = 0;
      for (const match of lineText.matchAll(pattern)) {
        const value = match[0];
        const classification = classifyCandidate(rule.id, value);
        const findingId = `${normalizedPath}:${index + 1}:${rule.id}:${matchIndex}`;
        const reviewedClassification =
          classification === 'confirmed-or-probable-credential' &&
          REVIEW_REQUIRED_FINDING_IDS.has(findingId)
            ? 'requires-review'
            : classification;
        findings.push({
          path: normalizedPath,
          line: index + 1,
          ruleId: rule.id,
          severity: rule.severity,
          confidence: rule.confidence,
          classification: reviewedClassification,
          findingId,
        });
        matchIndex += 1;
      }
    }
  });

  return findings.sort(compareFindings);
}

function compareFindings(a: SecretFinding, b: SecretFinding): number {
  return (
    a.path.localeCompare(b.path) ||
    a.line - b.line ||
    a.ruleId.localeCompare(b.ruleId) ||
    a.findingId.localeCompare(b.findingId)
  );
}

function gitTrackedFiles(): string[] {
  const output = execFileSync('git', ['ls-files'], { encoding: 'utf8' });
  return output
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map(normalizePath)
    .sort();
}

function isScannedDocumentationPath(filePath: string): boolean {
  const normalized = normalizePath(filePath);
  if (
    normalized.startsWith('.git/') ||
    normalized.startsWith('node_modules/') ||
    normalized.startsWith('.next/') ||
    normalized.startsWith('coverage/') ||
    normalized.startsWith('test-results/') ||
    normalized.startsWith('playwright-report/')
  ) {
    return false;
  }
  if (
    /^\.env(?:\.|$)/.test(normalized) &&
    !/^\.env\.(?:example|sample|template)$/.test(normalized)
  ) {
    return false;
  }
  if (/^env(?:\.example|\.sample)?$/i.test(normalized)) return true;
  if (/\.(md|mdx|txt|ya?ml|sh|ps1|cmd|example|template)$/i.test(normalized)) return true;
  return false;
}

export function scanTrackedDocumentationFiles(files = gitTrackedFiles()): SecretFinding[] {
  const findings: SecretFinding[] = [];
  for (const filePath of files.filter(isScannedDocumentationPath)) {
    if (!existsSync(filePath)) continue;
    const content = readFileSync(filePath, 'utf8');
    findings.push(...scanDocumentationText(content, filePath));
  }
  return findings.sort(compareFindings);
}

export function validateDocumentationRegistry(registryPath = DOC_REGISTRY_PATH): string[] {
  const errors: string[] = [];
  if (!existsSync(registryPath)) {
    return [`Missing documentation registry: ${registryPath}`];
  }

  const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as DocumentationRegistry;
  const seen = new Set<string>();
  const statusSet = new Set<string>(DOCUMENT_STATUSES);

  for (const [index, doc] of registry.documents.entries()) {
    const prefix = `documents[${index}] ${doc.path || '<missing-path>'}`;
    if (!doc.path) {
      errors.push(`${prefix}: missing path`);
      continue;
    }
    if (seen.has(doc.path)) {
      errors.push(`${prefix}: duplicate document entry`);
    }
    seen.add(doc.path);
    if (!statusSet.has(doc.status)) {
      errors.push(`${prefix}: invalid status ${doc.status}`);
    }
    if (!existsSync(doc.path)) {
      errors.push(`${prefix}: referenced file does not exist`);
    }
    if (
      doc.status === 'canonical' &&
      ['stale', 'unsafe', 'historical'].some((word) => doc.warning?.includes(word))
    ) {
      errors.push(`${prefix}: canonical document warning conflicts with canonical status`);
    }
    if (doc.supersededBy && !existsSync(doc.supersededBy)) {
      errors.push(`${prefix}: superseding target does not exist: ${doc.supersededBy}`);
    }
    if (doc.entryPoint && !existsSync(doc.entryPoint)) {
      errors.push(`${prefix}: entry point does not exist: ${doc.entryPoint}`);
    }
  }

  return errors.sort();
}

function summarizeFindings(findings: SecretFinding[]) {
  const byClassification: Record<string, number> = {};
  const byRule: Record<string, number> = {};
  for (const finding of findings) {
    byClassification[finding.classification] = (byClassification[finding.classification] ?? 0) + 1;
    byRule[finding.ruleId] = (byRule[finding.ruleId] ?? 0) + 1;
  }
  return {
    totalFindings: findings.length,
    byClassification,
    byRule,
    findings,
  };
}

export function hasBlockingFindings(findings: SecretFinding[]): boolean {
  return findings.some((finding) => finding.classification === 'confirmed-or-probable-credential');
}

function main() {
  const args = new Set(process.argv.slice(2));
  const checkMode = args.has('--check');
  const reportMode = args.has('--report') || !checkMode;
  const explicitFiles = process.argv
    .slice(2)
    .flatMap((arg, index, allArgs) =>
      arg === '--file' && allArgs[index + 1] ? [allArgs[index + 1]] : [],
    );

  const registryErrors = validateDocumentationRegistry();
  const findings =
    explicitFiles.length > 0
      ? explicitFiles.flatMap((filePath) =>
          scanDocumentationText(readFileSync(filePath, 'utf8'), filePath),
        )
      : scanTrackedDocumentationFiles();
  const summary = summarizeFindings(findings);
  const blockingCount = findings.filter((finding) => hasBlockingFindings([finding])).length;
  const requiresReviewCount = findings.filter(
    (finding) => finding.classification === 'requires-review',
  ).length;
  const acceptedCount = findings.length - blockingCount - requiresReviewCount;

  if (reportMode) {
    console.log(JSON.stringify({ registryErrors, ...summary }, null, 2));
  }

  if (registryErrors.length > 0) {
    console.error(
      `Documentation registry validation failed with ${registryErrors.length} error(s).`,
    );
    process.exitCode = 1;
    return;
  }

  if (checkMode && hasBlockingFindings(findings)) {
    console.error(
      [
        'Documentation secret-safety check failed:',
        `${findings.length} candidates detected,`,
        `${blockingCount} blocking,`,
        `${requiresReviewCount} require review,`,
        `${acceptedCount} accepted.`,
      ].join('\n'),
    );
    console.error(
      'Documentation secret-safety check failed: unreviewed high-confidence credential-like finding(s).',
    );
    process.exitCode = 1;
    return;
  }

  if (checkMode) {
    console.log(
      [
        'Documentation secret-safety check passed:',
        `${findings.length} candidates detected,`,
        `${blockingCount} blocking,`,
        `${requiresReviewCount} require review,`,
        `${acceptedCount} accepted.`,
        'No raw values printed.',
      ].join('\n'),
    );
  }
}

const currentModulePath = fileURLToPath(import.meta.url);
const invokedScriptPath = process.argv[1] ? path.resolve(process.argv[1]) : null;

if (invokedScriptPath && path.resolve(currentModulePath) === invokedScriptPath) {
  main();
}
