#!/usr/bin/env tsx

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadDotenv } from 'dotenv';

type RuntimeTarget = 'development' | 'preview' | 'production';
type KeyMode = 'live' | 'test' | 'missing' | 'unknown';
type Severity = 'PASS' | 'WARN' | 'FAIL';

type Finding = {
  severity: Severity;
  code: string;
  message: string;
  action?: string;
};

type EnvSnapshot = {
  source: string;
  values: Record<string, string>;
};

const DB_KEYS = ['DATABASE_URL', 'DIRECT_URL'] as const;

const COMMERCE_KEYS = [
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
] as const;

const AUTH_KEYS = ['CLERK_SECRET_KEY', 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'] as const;

const CORE_KEYS = [
  ...DB_KEYS,
  ...AUTH_KEYS,
  ...COMMERCE_KEYS,
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
] as const;

const OPTIONAL_INTEGRATIONS = ['PRINTIFY_API_KEY', 'PRINTIFY_SHOP_ID', 'RESEND_API_KEY'] as const;

const keyPrefixRules = {
  stripeSecret: {
    live: ['sk_live_', 'rk_live_'],
    test: ['sk_test_', 'rk_test_'],
  },
  stripePublishable: {
    live: ['pk_live_'],
    test: ['pk_test_'],
  },
  clerkSecret: {
    live: ['sk_live_'],
    test: ['sk_test_'],
  },
  clerkPublishable: {
    live: ['pk_live_'],
    test: ['pk_test_'],
  },
} as const;

const parserArgs = process.argv.slice(2);

function getArgValue(name: string): string | null {
  const direct = parserArgs.find((arg) => arg.startsWith(`--${name}=`));
  if (direct) {
    return direct.slice(name.length + 3);
  }

  const index = parserArgs.findIndex((arg) => arg === `--${name}`);
  if (index >= 0 && parserArgs[index + 1]) {
    return parserArgs[index + 1];
  }

  return null;
}

function parseTarget(raw: string | null | undefined): RuntimeTarget {
  const normalized = (raw ?? '').trim().toLowerCase();
  if (normalized === 'production') return 'production';
  if (normalized === 'preview') return 'preview';
  if (normalized === 'development') return 'development';
  return 'development';
}

function detectTarget(): RuntimeTarget {
  const cliTarget = getArgValue('target');
  if (cliTarget) return parseTarget(cliTarget);

  const envTarget = process.env.APP_ENV_TARGET ?? process.env.VERCEL_ENV;
  if (envTarget) return parseTarget(envTarget);

  return process.env.NODE_ENV === 'production' ? 'production' : 'development';
}

function readEnvFile(filepath: string): Record<string, string> {
  if (!existsSync(filepath)) return {};

  const parsed: Record<string, string> = {};
  const content = readFileSync(filepath, 'utf8');
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;

    const key = match[1];
    let value = match[2] ?? '';

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    parsed[key] = value;
  }

  return parsed;
}

function inferKeyMode(
  value: string | undefined,
  livePrefixes: readonly string[],
  testPrefixes: readonly string[],
): KeyMode {
  if (!value) return 'missing';
  const trimmed = value.trim();
  if (!trimmed) return 'missing';

  if (livePrefixes.some((prefix) => trimmed.startsWith(prefix))) return 'live';
  if (testPrefixes.some((prefix) => trimmed.startsWith(prefix))) return 'test';

  return 'unknown';
}

function maskPrefix(value: string | undefined): string {
  if (!value) return 'missing';
  const trimmed = value.trim();
  if (!trimmed) return 'missing';
  const prefix = trimmed.slice(0, Math.min(10, trimmed.length));
  return `${prefix}...`;
}

function dbFingerprint(url: string | undefined): string {
  if (!url) return 'missing';

  try {
    const parsed = new URL(url);
    const dbName = parsed.pathname.replace(/^\//, '') || '(none)';
    const schema = parsed.searchParams.get('schema');
    return [
      `scheme=${parsed.protocol.replace(':', '')}`,
      `host=${parsed.host}`,
      `db=${dbName}`,
      schema ? `schema=${schema}` : undefined,
    ]
      .filter(Boolean)
      .join(' | ');
  } catch {
    return 'invalid-url';
  }
}

function addFinding(
  list: Finding[],
  severity: Severity,
  code: string,
  message: string,
  action?: string,
) {
  list.push({ severity, code, message, ...(action ? { action } : {}) });
}

function evaluateModeAlignment(
  findings: Finding[],
  target: RuntimeTarget,
  label: string,
  secretMode: KeyMode,
  publishableMode: KeyMode,
) {
  const allowLiveInNonProd = process.env.ALLOW_LIVE_KEYS_IN_NON_PROD === 'true';
  const allowTestInProd = process.env.ALLOW_TEST_KEYS_IN_PRODUCTION === 'true';

  if (secretMode === 'missing' || publishableMode === 'missing') {
    addFinding(
      findings,
      'FAIL',
      `${label.toUpperCase()}_MISSING`,
      `${label} keys are missing (secret=${secretMode}, publishable=${publishableMode}).`,
      `Set both ${label} secret and publishable keys for ${target}.`,
    );
    return;
  }

  if (secretMode !== publishableMode) {
    addFinding(
      findings,
      'FAIL',
      `${label.toUpperCase()}_MISMATCH`,
      `${label} key mode mismatch (secret=${secretMode}, publishable=${publishableMode}).`,
      `Keep ${label} secret and publishable keys on the same mode (both test or both live).`,
    );
    return;
  }

  if (target === 'production') {
    if (secretMode === 'test' && !allowTestInProd) {
      addFinding(
        findings,
        'FAIL',
        `${label.toUpperCase()}_TEST_IN_PROD`,
        `${label} is using test keys in production target.`,
        'Use live keys for production, or set ALLOW_TEST_KEYS_IN_PRODUCTION=true for a temporary maintenance window.',
      );
      return;
    }

    if (secretMode === 'test' && allowTestInProd) {
      addFinding(
        findings,
        'WARN',
        `${label.toUpperCase()}_TEST_IN_PROD_OVERRIDE`,
        `${label} test keys are allowed in production by override.`,
        'Remove ALLOW_TEST_KEYS_IN_PRODUCTION=true after the maintenance/test window.',
      );
      return;
    }
  }

  if (target !== 'production') {
    if (secretMode === 'live' && !allowLiveInNonProd) {
      addFinding(
        findings,
        'FAIL',
        `${label.toUpperCase()}_LIVE_IN_NON_PROD`,
        `${label} is using live keys in ${target} target.`,
        'Use test keys for non-production, or set ALLOW_LIVE_KEYS_IN_NON_PROD=true only if strictly required.',
      );
      return;
    }

    if (secretMode === 'live' && allowLiveInNonProd) {
      addFinding(
        findings,
        'WARN',
        `${label.toUpperCase()}_LIVE_IN_NON_PROD_OVERRIDE`,
        `${label} live keys are allowed in ${target} by override.`,
        'Remove ALLOW_LIVE_KEYS_IN_NON_PROD=true once validation is complete.',
      );
      return;
    }
  }

  addFinding(
    findings,
    'PASS',
    `${label.toUpperCase()}_MODE_OK`,
    `${label} key mode is consistent for ${target}.`,
  );
}

function scanPublicSecretLeakage(findings: Finding[]) {
  const sensitivePrefixes = ['sk_live_', 'sk_test_', 'rk_live_', 'rk_test_', 'whsec_'];

  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith('NEXT_PUBLIC_')) continue;
    if (!value) continue;

    const matchesSensitive = sensitivePrefixes.some((prefix) => value.startsWith(prefix));
    if (matchesSensitive) {
      addFinding(
        findings,
        'FAIL',
        'PUBLIC_SECRET_LEAK',
        `${key} appears to contain a server secret value prefix.`,
        `Move the secret into a server-only env key and keep NEXT_PUBLIC_* for safe client-side values only.`,
      );
    }
  }
}

function inspectEnvFiles(): EnvSnapshot[] {
  const files = [
    '.env.local',
    '.env',
    '.env.vercel.development',
    '.env.vercel.preview',
    '.env.vercel.production',
  ];

  return files
    .map((file) => ({ source: file, values: readEnvFile(resolve(process.cwd(), file)) }))
    .filter((snapshot) => Object.keys(snapshot.values).length > 0);
}

function printFindings(findings: Finding[]) {
  const ordered = ['FAIL', 'WARN', 'PASS'] as const;
  for (const severity of ordered) {
    const group = findings.filter((finding) => finding.severity === severity);
    if (group.length === 0) continue;

    console.log(`\n${severity} findings (${group.length})`);
    for (const finding of group) {
      console.log(`- [${finding.code}] ${finding.message}`);
      if (finding.action) {
        console.log(`  action: ${finding.action}`);
      }
    }
  }
}

async function main() {
  loadDotenv({ path: resolve(process.cwd(), '.env.local') });
  loadDotenv({ path: resolve(process.cwd(), '.env') });

  const target = detectTarget();
  const findings: Finding[] = [];
  const snapshots = inspectEnvFiles();

  const stripeSecretMode = inferKeyMode(
    process.env.STRIPE_SECRET_KEY,
    keyPrefixRules.stripeSecret.live,
    keyPrefixRules.stripeSecret.test,
  );
  const stripePublishableMode = inferKeyMode(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    keyPrefixRules.stripePublishable.live,
    keyPrefixRules.stripePublishable.test,
  );

  const clerkSecretMode = inferKeyMode(
    process.env.CLERK_SECRET_KEY,
    keyPrefixRules.clerkSecret.live,
    keyPrefixRules.clerkSecret.test,
  );
  const clerkPublishableMode = inferKeyMode(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    keyPrefixRules.clerkPublishable.live,
    keyPrefixRules.clerkPublishable.test,
  );

  for (const key of CORE_KEYS) {
    const value = process.env[key];
    if (!value || !value.trim()) {
      addFinding(
        findings,
        'FAIL',
        `CORE_MISSING_${key}`,
        `${key} is missing for runtime target ${target}.`,
      );
    }
  }

  for (const key of OPTIONAL_INTEGRATIONS) {
    const value = process.env[key];
    if (!value || !value.trim()) {
      addFinding(
        findings,
        'WARN',
        `OPTIONAL_MISSING_${key}`,
        `${key} is missing (optional integration not fully enabled).`,
      );
    }
  }

  evaluateModeAlignment(findings, target, 'stripe', stripeSecretMode, stripePublishableMode);
  evaluateModeAlignment(findings, target, 'clerk', clerkSecretMode, clerkPublishableMode);

  if (
    (process.env.STRIPE_SECRET_KEY ?? '').trim() &&
    !(process.env.STRIPE_WEBHOOK_SECRET ?? '').trim()
  ) {
    addFinding(
      findings,
      'FAIL',
      'STRIPE_WEBHOOK_SECRET_MISSING',
      'STRIPE_SECRET_KEY is set but STRIPE_WEBHOOK_SECRET is missing.',
      'Set STRIPE_WEBHOOK_SECRET for webhook signature verification.',
    );
  }

  scanPublicSecretLeakage(findings);

  const databaseUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;

  const databaseFingerprint = dbFingerprint(databaseUrl);
  const directFingerprint = dbFingerprint(directUrl);

  if (databaseFingerprint === 'invalid-url') {
    addFinding(findings, 'FAIL', 'DATABASE_URL_INVALID', 'DATABASE_URL is not a valid URL.');
  }

  if (directUrl && directFingerprint === 'invalid-url') {
    addFinding(findings, 'FAIL', 'DIRECT_URL_INVALID', 'DIRECT_URL is not a valid URL.');
  }

  if (target === 'production' && databaseFingerprint.includes('host=localhost')) {
    addFinding(
      findings,
      'FAIL',
      'DATABASE_LOCALHOST_PROD',
      'DATABASE_URL points to localhost in production target.',
      'Point DATABASE_URL to production managed Postgres.',
    );
  }

  const feedMode = (process.env.STRIPE_PRODUCT_FEED_MODE ?? 'upsert').trim().toLowerCase();
  if (feedMode !== 'upsert' && feedMode !== 'replace') {
    addFinding(
      findings,
      'FAIL',
      'STRIPE_FEED_MODE_INVALID',
      `STRIPE_PRODUCT_FEED_MODE=${feedMode} is invalid.`,
      'Use STRIPE_PRODUCT_FEED_MODE=upsert or STRIPE_PRODUCT_FEED_MODE=replace.',
    );
  } else if (feedMode === 'replace' && process.env.STRIPE_PRODUCT_FEED_REPLACE_CONFIRM !== 'true') {
    addFinding(
      findings,
      'WARN',
      'STRIPE_FEED_REPLACE_CONFIRM_MISSING',
      'replace mode selected without STRIPE_PRODUCT_FEED_REPLACE_CONFIRM=true.',
      'Set STRIPE_PRODUCT_FEED_REPLACE_CONFIRM=true only for intentional full-catalog replace.',
    );
  }

  if (
    target !== 'production' &&
    stripeSecretMode === 'live' &&
    process.env.STRIPE_FEED_LIVE_CONFIRM !== 'true'
  ) {
    addFinding(
      findings,
      'WARN',
      'STRIPE_FEED_LIVE_CONFIRM_NOT_SET',
      'Live Stripe key detected in non-production and STRIPE_FEED_LIVE_CONFIRM is not set.',
      'Uploads will be blocked unless STRIPE_FEED_LIVE_CONFIRM=true.',
    );
  }

  for (const snapshot of snapshots) {
    const candidate = snapshot.values.DATABASE_URL;
    if (candidate && candidate.replace(/"/g, '').trim() === '') {
      addFinding(
        findings,
        'WARN',
        'ENV_FILE_EMPTY_DATABASE_URL',
        `${snapshot.source} has an empty DATABASE_URL value.`,
        'If this file is used for deployment sync, populate it or remove the key to avoid confusion.',
      );
    }
  }

  console.log('\nRuntime integration readiness audit');
  console.log(`- target: ${target}`);
  console.log(
    `- stripe secret mode: ${stripeSecretMode} (${maskPrefix(process.env.STRIPE_SECRET_KEY)})`,
  );
  console.log(
    `- stripe publishable mode: ${stripePublishableMode} (${maskPrefix(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)})`,
  );
  console.log(
    `- clerk secret mode: ${clerkSecretMode} (${maskPrefix(process.env.CLERK_SECRET_KEY)})`,
  );
  console.log(
    `- clerk publishable mode: ${clerkPublishableMode} (${maskPrefix(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)})`,
  );
  console.log(`- database: ${databaseFingerprint}`);
  console.log(`- direct db: ${directFingerprint}`);

  printFindings(findings);

  const failCount = findings.filter((finding) => finding.severity === 'FAIL').length;
  const warnCount = findings.filter((finding) => finding.severity === 'WARN').length;
  const passCount = findings.filter((finding) => finding.severity === 'PASS').length;

  console.log(`\nSummary: PASS=${passCount} WARN=${warnCount} FAIL=${failCount}`);

  if (failCount > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Audit crashed:', error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
