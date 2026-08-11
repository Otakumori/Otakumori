import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

type FindingClassification =
  | 'confirmed-or-probable-credential'
  | 'tracked-secret-artifact'
  | 'placeholder'
  | 'environment-reference'
  | 'public-or-test-value'
  | 'requires-review';

export type TrackedSecretFinding = {
  path: string;
  line: number;
  ruleId: string;
  classification: FindingClassification;
  value: 'REDACTED';
};

type SecretRule = {
  id: string;
  pattern: RegExp;
};

const SECRET_RULES: SecretRule[] = [
  {
    id: 'postgres_connection_url',
    pattern: /\bpostgres(?:ql)?:\/\/[^\s'"`)<>]+/gi,
  },
  {
    id: 'stripe_or_clerk_secret_key',
    pattern: /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}\b/g,
  },
  {
    id: 'stripe_webhook_secret',
    pattern: /\bwhsec_[A-Za-z0-9]{16,}\b/g,
  },
  {
    id: 'authorization_bearer_value',
    pattern: /\bBearer\s+[A-Za-z0-9._~+/=-]{24,}\b/g,
  },
  {
    id: 'private_key_block',
    pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g,
  },
  {
    id: 'secret_env_assignment',
    pattern:
      /\b(?:DATABASE_URL|DIRECT_URL|[A-Z0-9_]*(?:SECRET|TOKEN|PRIVATE_KEY|API_KEY|ACCESS_KEY|PASSWORD)[A-Z0-9_]*)\s*=\s*([^\s#'"`<>][^\s#]*)/g,
  },
  {
    id: 'vercel_protection_bypass',
    pattern: /\b(?:VERCEL_AUTOMATION_BYPASS_SECRET|x-vercel-protection-bypass|x-vercel-set-bypass-cookie)\b/gi,
  },
];

const BINARY_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.ico',
  '.pdf',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.mp4',
  '.mov',
  '.zip',
  '.gz',
  '.br',
  '.wasm',
]);

const SAFE_ENV_FILES = new Set([
  '.env.example',
  '.env.template',
  '.env.test',
  '.env.test.example',
  'upgrade_config.env.example',
]);
const SCANNER_FIXTURE_FILES = new Set([
  '__tests__/docs/docs-security-check.test.ts',
  '__tests__/scripts/security-scan.test.ts',
  'scripts/docs-security-check.ts',
  'scripts/security-scan.ts',
]);
const PLACEHOLDER_RE =
  /^(?:|<[^>]+>|\[[A-Z0-9_-]+\]|\$\{[A-Z0-9_]+\}|\$[A-Z0-9_]+|%[A-Z0-9_]+%|your[_-]?[A-Z0-9_-]*|placeholder|dummy|fake|test[_-]?value|changeme|redacted|\*{3,}|x{4,}|\.{3})$/i;
const PUBLIC_OR_TEST_RE =
  /^(?:true|false|0|1|null|undefined|localhost|127\.0\.0\.1|postgresql:\/\/test|pk_test_[A-Za-z0-9_-]+|pk_live_[A-Za-z0-9_-]+|https?:\/\/(?:www\.)?otaku-mori\.com.*)$/i;
const ENV_REFERENCE_RE =
  /^(?:process\.env\.[A-Z0-9_]+|\$\{\{\s*secrets\.[A-Z0-9_]+\s*\}\}|[A-Z0-9_]+)$/;
const ENV_REFERENCE_LINE_RE =
  /(?:process\.env\.|import\.meta\.env\.|serverEnv\.|clientEnv\.|env\.|\$\{\{\s*secrets\.|\$\{[A-Z0-9_]+\}|\$env:|\$\(|\$GITHUB_ENV)/i;
const CODE_LITERAL_RE = /^(?:\{|\[|\(|new\b|as\b|const\b|let\b|var\b|type\b|interface\b)/i;
const CODE_REFERENCE_RE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)+$/;

function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/').replace(/^\.\//, '');
}

function isTrackedEnvArtifact(filePath: string): boolean {
  const basename = path.posix.basename(normalizePath(filePath));
  if (SAFE_ENV_FILES.has(normalizePath(filePath)) || SAFE_ENV_FILES.has(basename)) return false;
  return /^\.env(?:\.|$)/.test(basename) || /\.env$/i.test(basename);
}

function shouldScanFile(filePath: string): boolean {
  const normalized = normalizePath(filePath);
  if (
    normalized.startsWith('node_modules/') ||
    normalized.startsWith('.git/') ||
    normalized.startsWith('.next/') ||
    normalized.startsWith('dist/') ||
    normalized.startsWith('build/') ||
    normalized.startsWith('out/') ||
    normalized.startsWith('coverage/')
  ) {
    return false;
  }
  if (SCANNER_FIXTURE_FILES.has(normalized)) return false;
  return !BINARY_EXTENSIONS.has(path.extname(normalized).toLowerCase());
}

function assignedValue(match: string): string {
  return match.includes('=') ? match.split('=').slice(1).join('=').trim() : match.trim();
}

function normalizeCandidateValue(value: string): string {
  return value
    .trim()
    .replace(/[,;]+$/g, '')
    .trim()
    .replace(/^['"`](.*)['"`]$/s, '$1')
    .trim();
}

function classify(ruleId: string, match: string, line: string): FindingClassification {
  const value = normalizeCandidateValue(
    ruleId === 'secret_env_assignment' ? assignedValue(match) : match,
  );

  if (ENV_REFERENCE_LINE_RE.test(line)) return 'environment-reference';
  if (PLACEHOLDER_RE.test(value)) return 'placeholder';
  if (PUBLIC_OR_TEST_RE.test(value)) return 'public-or-test-value';
  if (CODE_LITERAL_RE.test(value)) return 'environment-reference';
  if (CODE_REFERENCE_RE.test(value)) return 'environment-reference';
  if (/(?:process\.env|import\.meta\.env|serverEnv\.|clientEnv\.|env\.)[A-Z0-9_]+/i.test(value)) {
    return 'environment-reference';
  }
  if (ENV_REFERENCE_RE.test(value)) return 'environment-reference';
  if (/^postgres(?:ql)?:\/\/(?:[^:]+):(?:password|pass|test|local|postgres|[a-z0-9_-]*placeholder[a-z0-9_-]*)@(?:localhost|127\.0\.0\.1|postgres)(?::5432)?\//i.test(value)) {
    return 'placeholder';
  }
  if (/^sk_(?:live|test)_\*+$/i.test(value) || /^whsec_\*+$/i.test(value)) return 'placeholder';
  if (/^postgres(?:ql)?:\/\/.*(?:example|invalid|<[^>]+>)/i.test(value)) return 'placeholder';

  return ruleId === 'vercel_protection_bypass' ? 'requires-review' : 'confirmed-or-probable-credential';
}

export function scanText(text: string, filePath: string): TrackedSecretFinding[] {
  const normalized = normalizePath(filePath);
  const findings: TrackedSecretFinding[] = [];

  if (isTrackedEnvArtifact(normalized)) {
    findings.push({
      path: normalized,
      line: 0,
      ruleId: 'tracked_env_artifact',
      classification: 'tracked-secret-artifact',
      value: 'REDACTED',
    });
  }

  text.split(/\r?\n/).forEach((line, index) => {
    for (const rule of SECRET_RULES) {
      const pattern = new RegExp(rule.pattern.source, rule.pattern.flags);
      for (const match of line.matchAll(pattern)) {
        findings.push({
          path: normalized,
          line: index + 1,
          ruleId: rule.id,
          classification: classify(rule.id, match[0], line),
          value: 'REDACTED',
        });
      }
    }
  });

  return findings.sort(compareFindings);
}

function compareFindings(a: TrackedSecretFinding, b: TrackedSecretFinding): number {
  return a.path.localeCompare(b.path) || a.line - b.line || a.ruleId.localeCompare(b.ruleId);
}

function gitTrackedFiles(): string[] {
  const output = execFileSync('git', ['ls-files', '-z']);
  return output
    .toString('utf8')
    .split('\0')
    .filter(Boolean)
    .map(normalizePath)
    .sort();
}

export function scanTrackedFiles(files = gitTrackedFiles()): TrackedSecretFinding[] {
  const findings: TrackedSecretFinding[] = [];

  for (const filePath of files.filter(shouldScanFile)) {
    if (!existsSync(filePath)) continue;
    try {
      if (statSync(filePath).size > 1024 * 1024) continue;
      findings.push(...scanText(readFileSync(filePath, 'utf8'), filePath));
    } catch {
      findings.push({
        path: normalizePath(filePath),
        line: 0,
        ruleId: 'scan_error',
        classification: 'requires-review',
        value: 'REDACTED',
      });
    }
  }

  return findings.sort(compareFindings);
}

export function hasBlockingFindings(findings: TrackedSecretFinding[]): boolean {
  return findings.some((finding) =>
    ['confirmed-or-probable-credential', 'tracked-secret-artifact', 'requires-review'].includes(
      finding.classification,
    ),
  );
}

function main() {
  const args = new Set(process.argv.slice(2));
  const checkMode = args.has('--check');
  const findings = scanTrackedFiles();
  const blocking = findings.filter((finding) => hasBlockingFindings([finding]));

  if (!checkMode) {
    console.log(JSON.stringify({ findings }, null, 2));
  }

  if (blocking.length > 0) {
    console.error(
      [
        'Tracked secret scan failed:',
        `${findings.length} redacted finding(s),`,
        `${blocking.length} blocking.`,
        'No raw values printed.',
      ].join('\n'),
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    [
      'Tracked secret scan passed:',
      `${findings.length} redacted finding(s),`,
      '0 blocking.',
      'No raw values printed.',
    ].join('\n'),
  );
}

const currentModulePath = fileURLToPath(import.meta.url);
const invokedScriptPath = process.argv[1] ? path.resolve(process.argv[1]) : null;

if (invokedScriptPath && path.resolve(currentModulePath) === invokedScriptPath) {
  main();
}
