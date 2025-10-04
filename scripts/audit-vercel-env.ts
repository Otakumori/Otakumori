#!/usr/bin/env node
/**
 * Vercel Environment Variables Audit Script
 *
 * Inspects Production, Preview, and Development environments on Vercel
 * to identify missing variables, domain mismatches, and Clerk configuration issues.
 *
 * Usage: VERCEL_TOKEN=xxx node scripts/audit-vercel-env.ts
 * Or: VERCEL_TOKEN=xxx PROJECT_NAME=otakumori node scripts/audit-vercel-env.ts

// Required environment variables by category
const REQUIRED_SERVER = [
  'DATABASE_URL',
  'CLERK_SECRET_KEY',
  'CLERK_ENCRYPTION_KEY',
  'CLERK_WEBHOOK_SECRET',
  'PRINTIFY_API_KEY',
  'PRINTIFY_SHOP_ID',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
] as const;

const REQUIRED_CLIENT = [
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
] as const;

const RECOMMENDED = [
  'NEXT_PUBLIC_CANONICAL_ORIGIN',
  'RESEND_API_KEY',
  'SENTRY_DSN',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'BLOB_READ_WRITE_TOKEN',
] as const;

type RequiredServer = typeof REQUIRED_SERVER[number];
type RequiredClient = typeof REQUIRED_CLIENT[number];

interface VercelEnvVar {
  type: string;
  id: string;
  key: string;
  value: string;
  target: string[];
  gitBranch?: string;
  configurationId?: string;
  updatedAt: number;
  createdAt: number;
}

interface SuspiciousEntry {
  key: string;
  value: string;
  reason: string;
}

interface EnvAuditResult {
  missing: string[];
  empty: string[];
  suspicious: SuspiciousEntry[];
  present: string[];
}

type LocalEnv = Record<string, string>;

interface LocalComparison {
  localOnly: string[];
  vercelOnly: string[];
  different: { key: string; local: string; vercel: string }[];
}

// Utility functions
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { execSync } from 'child_process';

function runVercelCommand(command: string): string {
  try {
    const projectFlag = process.env.PROJECT_NAME ? `--project ${process.env.PROJECT_NAME}` : '';
    const fullCommand = `vercel ${command} ${projectFlag}`.trim();
    console.log(`Running: ${fullCommand}`);
    // Ensure VERCEL_TOKEN and current env are forwarded
    const env = { ...process.env, VERCEL_TOKEN: otmEnv.VERCEL_TOKEN ?? '' };
    return execSync(fullCommand, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      env,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(` Failed to run Vercel command: ${command}`);
    console.error(`Error: ${message}`);
    process.exit(1);
  }
}

function loadLocalEnv(): LocalEnv {
  const envPath = join(process.cwd(), '.env.local');
  const env: LocalEnv = {};

  if (!existsSync(envPath)) {
    console.log('ⓘ  No .env.local file found');
    return env;
  }

  try {
    const content = readFileSync(envPath, 'utf8');
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    }

    console.log(`ⓘ  Loaded ${Object.keys(env).length} variables from .env.local`);
  } catch (error) {
    console.warn(`  Could not read .env.local: ${error}`);
  }

  return env;
}

function fetchVercelEnvs(environment: 'production' | 'preview' | 'development'): VercelEnvVar[] {
  try {
    // Vercel supports `vercel env ls <env>` and `vercel env list <env>`
    const output = runVercelCommand(`env ls ${environment}`);
    // Parse the text output from Vercel CLI table format
    const lines = output.split('\n').filter((line) => line.trim());
    const envVars: VercelEnvVar[] = [];

    let inDataSection = false;
    for (const line of lines) {
      const trimmed = line.trim();

      // Start data section after header line with 'name'
      if (
        trimmed.toLowerCase().includes('name') &&
        trimmed.toLowerCase().includes('value') &&
        trimmed.toLowerCase().includes('environments')
      ) {
        inDataSection = true;
        continue;
      }

      // Skip lines that are clearly not data
      if (
        !inDataSection ||
        !trimmed ||
        /Environment Variables found/i.test(trimmed) ||
        /Vercel CLI/i.test(trimmed) ||
        trimmed.startsWith('>') ||
        /created/i.test(trimmed)
      ) {
        continue;
      }

      // Parse data lines - they start with the variable name
      if (inDataSection && trimmed && !trimmed.startsWith('-')) {
        // Split by multiple spaces to separate columns
        const parts = trimmed.split(/\s{2,}/);
        if (parts.length >= 3) {
          const name = parts[0].trim();
          const value = parts[1].trim();
          const environments = parts[2].trim();

          // Check if this variable applies to the current environment
          if (environments.toLowerCase().includes(environment.toLowerCase())) {
            envVars.push({
              type: 'secret',
              id: `${name}-${environment}`,
              key: name,
              value: value === 'Encrypted' ? '[REDACTED]' : value,
              target: [environment],
              updatedAt: Date.now(),
              createdAt: Date.now(),
            });
          }
        }
      }
    }

    return envVars;
  } catch {
    console.error(` Failed to fetch ${environment} environment variables`);
    return [];
  }
}

function analyzeEnvironment(
  envVars: VercelEnvVar[],
  environment: 'production' | 'preview' | 'development',
  localEnv: LocalEnv,
): EnvAuditResult {
  const result: EnvAuditResult = {
    missing: [],
    empty: [],
    suspicious: [],
    present: [],
  };

  // Create lookup map
  const envMap = new Map<string, string>();
  envVars.forEach((env) => {
    envMap.set(env.key, env.value || '');
  });

  // Check required variables
  const allRequired: string[] = [...REQUIRED_SERVER, ...REQUIRED_CLIENT];

  for (const requiredVar of allRequired) {
    if (!envMap.has(requiredVar)) {
      result.missing.push(requiredVar);
    } else {
      const value = envMap.get(requiredVar)!;
      result.present.push(requiredVar);

      if (!value || value.trim() === '') {
        result.empty.push(requiredVar);
      } else if (value === '[REDACTED]' || value === '[HIDDEN]') {
        // Vercel redacts secret values, this is normal
        continue;
      } else {
        // Check for suspicious values
        const suspicious = checkSuspiciousValue(requiredVar, value, environment);
        if (suspicious) {
          result.suspicious.push({
            key: requiredVar,
            value: value.length > 50 ? value.substring(0, 50) + '...' : value,
            reason: suspicious,
          });
        }
      }
    }
  }

  return result;
}

function checkSuspiciousValue(
  key: string,
  value: string,
  environment: 'production' | 'preview' | 'development',
): string | null {
  // Domain/origin checks for production
  if (environment === 'production') {
    if (key === 'NEXT_PUBLIC_SITE_URL' && value !== 'https://www.otaku-mori.com') {
      return `Should be 'https://www.otaku-mori.com' in production, got '${value}'`;
    }
    if (key === 'NEXT_PUBLIC_APP_URL' && value !== 'https://otaku-mori.com') {
      return `Should be 'https://otaku-mori.com' in production, got '${value}'`;
    }
  }

  // Clerk key environment checks
  if (key === 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY') {
    if (environment === 'production' && value.startsWith('pk_test_')) {
      return 'Using test publishable key in production environment';
    }
    if (environment !== 'production' && value.startsWith('pk_live_')) {
      return 'Using live publishable key in non-production environment';
    }
  }

  if (key === 'CLERK_SECRET_KEY') {
    if (environment === 'production' && value.startsWith('sk_test_')) {
      return 'Using test secret key in production environment';
    }
    if (environment !== 'production' && value.startsWith('sk_live_')) {
      return 'Using live secret key in non-production environment';
    }
  }

  // Database URL format checks
  if (key === 'DATABASE_URL') {
    if (
      !value.startsWith('postgresql://') &&
      !value.startsWith('postgres://') &&
      !value.startsWith('prisma://')
    ) {
      return 'DATABASE_URL should start with postgresql://, postgres://, or prisma://';
    }
  }

  // Numeric checks
  if (key === 'PRINTIFY_SHOP_ID' && !/^\d+$/.test(value)) {
    return 'PRINTIFY_SHOP_ID should be numeric';
  }

  // URL format checks
  const urlKeys = ['NEXT_PUBLIC_SITE_URL', 'NEXT_PUBLIC_APP_URL', 'PRINTIFY_API_URL'];
  if (urlKeys.includes(key) && !/^https?:\/\//i.test(value)) {
    return 'Should be a valid HTTP/HTTPS URL';
  }

  return null;
}

function compareWithLocal(vercelEnvs: VercelEnvVar[], localEnv: LocalEnv): LocalComparison {
  const vercelMap = new Map(vercelEnvs.map((env) => [env.key, env.value]));
  const localKeys = new Set(Object.keys(localEnv));
  const vercelKeys = new Set(vercelEnvs.map((env) => env.key));

  const localOnly = Array.from(localKeys).filter((key) => !vercelKeys.has(key));
  const vercelOnly = Array.from(vercelKeys).filter((key) => !localKeys.has(key));
  const different: LocalComparison['different'] = [];

  for (const [key, localValue] of Object.entries(localEnv)) {
    const vercelValue = vercelMap.get(key);
    if (vercelValue && vercelValue !== '[REDACTED]' && vercelValue !== localValue) {
      different.push({
        key,
        local: localValue.length > 30 ? localValue.substring(0, 30) + '...' : localValue,
        vercel: vercelValue.length > 30 ? vercelValue.substring(0, 30) + '...' : vercelValue,
      });
    }
  }

  return { localOnly, vercelOnly, different };
}

function printReport(
  environment: 'production' | 'preview' | 'development',
  result: EnvAuditResult,
  localComparison?: LocalComparison,
) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`⌕ ${environment.toUpperCase()} ENVIRONMENT AUDIT`);
  console.log(`${'='.repeat(60)}`);

  if (result.missing.length > 0) {
    console.log(`\n MISSING REQUIRED VARIABLES (${result.missing.length}):`);
    result.missing.forEach((key) => {
      console.log(`   • ${key}`);
    });
  }

  if (result.empty.length > 0) {
    console.log(`\n  EMPTY VALUES (${result.empty.length}):`);
    result.empty.forEach((key) => {
      console.log(`   • ${key}`);
    });
  }

  if (result.suspicious.length > 0) {
    console.log(`\n SUSPICIOUS VALUES (${result.suspicious.length}):`);
    result.suspicious.forEach(({ key, value, reason }) => {
      console.log(`   • ${key}: ${reason}`);
      console.log(`     Value: ${value}`);
    });
  }

  if (result.present.length > 0) {
    console.log(`\n PRESENT VARIABLES (${result.present.length}):`);
    const chunks: string[][] = [];
    for (let i = 0; i < result.present.length; i += 4) {
      chunks.push(result.present.slice(i, i + 4));
    }
    chunks.forEach((chunk) => {
      console.log(`   ${chunk.join(', ')}`);
    });
  }

  if (localComparison) {
    const { localOnly, vercelOnly, different } = localComparison;

    if (localOnly.length > 0) {
      console.log(`\n IN LOCAL .env.local BUT NOT ON VERCEL (${localOnly.length}):`);
      localOnly.forEach((key) => console.log(`   • ${key}`));
    }

    if (vercelOnly.length > 0) {
      console.log(`\n️  ON VERCEL BUT NOT IN LOCAL .env.local (${vercelOnly.length}):`);
      vercelOnly.forEach((key) => console.log(`   • ${key}`));
    }

    if (different.length > 0) {
      console.log(`\n VALUE DIFFERENCES (${different.length}):`);
      different.forEach(({ key, local, vercel }) => {
        console.log(`   • ${key}:`);
        console.log(`     Local:  ${local}`);
        console.log(`     Vercel: ${vercel}`);
      });
    }
  }
}

function printFixSuggestions(results: Record<string, EnvAuditResult>) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(` RECOMMENDED FIXES`);
  console.log(`${'='.repeat(60)}`);

  const allMissing = new Set<string>();
  Object.values(results).forEach((result) => {
    result.missing.forEach((key) => allMissing.add(key));
  });

  if (allMissing.size > 0) {
    console.log(`\n ADD THESE VARIABLES TO VERCEL:`);
    console.log(`   Go to: Vercel Dashboard → Project → Settings → Environment Variables`);
    console.log('');

    Array.from(allMissing).forEach((key) => {
      const example = getExampleValue(key);
      console.log(`   ${key}=${example}`);
    });
  }

  // Clerk-specific recommendations
  console.log(`\n CLERK CONFIGURATION CHECKLIST:`);

  const prodResult = results.production;
  if (prodResult?.suspicious.some((s) => s.key.includes('CLERK'))) {
    console.log(`    Production Clerk configuration issues detected`);
    console.log(`    Fix: Ensure production uses live Clerk keys (pk_live_*, sk_live_*)`);
    console.log(`    Fix: Set NEXT_PUBLIC_SITE_URL=https://www.otaku-mori.com`);
    console.log(`    Fix: In Clerk Dashboard → Domains, add both:`);
    console.log(`          - https://www.otaku-mori.com`);
    console.log(`          - https://otaku-mori.com`);
  }

  const previewResult = results.preview;
  if (previewResult?.suspicious.some((s) => s.key.includes('CLERK'))) {
    console.log(`     Preview environment using production Clerk keys`);
    console.log(`    Fix: Use development/test Clerk keys for preview deployments`);
    console.log(`    Fix: Add *.vercel.app domains to Clerk allowed origins`);
  }

  console.log(`\n DOMAIN/ORIGIN QUICK CHECKS:`);
  console.log(`   • Production NEXT_PUBLIC_SITE_URL must be: https://www.otaku-mori.com`);
  console.log(`   • Production NEXT_PUBLIC_APP_URL must be: https://otaku-mori.com`);
  console.log(`   • Clerk production keys only work with approved domains`);
  console.log(`   • Preview deployments should use test/dev Clerk keys`);
}

function getExampleValue(key: string): string {
  const examples: Record<string, string> = {
    DATABASE_URL: 'postgresql://user:pass@host:5432/db',
    CLERK_SECRET_KEY: 'sk_live_...',
    CLERK_ENCRYPTION_KEY: 'your-encryption-key',
    CLERK_WEBHOOK_SECRET: 'whsec_...',
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_live_...',
    PRINTIFY_API_KEY: 'your-printify-jwt-token',
    PRINTIFY_SHOP_ID: '12345678',
    STRIPE_SECRET_KEY: 'sk_live_...',
    STRIPE_WEBHOOK_SECRET: 'whsec_...',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_live_...',
    NEXT_PUBLIC_SITE_URL: 'https://www.otaku-mori.com',
    NEXT_PUBLIC_APP_URL: 'https://otaku-mori.com',
    RESEND_API_KEY: 're_...',
    UPSTASH_REDIS_REST_URL: 'https://your-redis.upstash.io',
    UPSTASH_REDIS_REST_TOKEN: 'your-redis-token',
  };

  return examples[key] || 'your-value-here';
}

// Main execution
async function main(): Promise<void> {
  console.log(' Starting Vercel Environment Variables Audit...\n');

  // Check prerequisites
  const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
  if (!VERCEL_TOKEN) {
    console.error(' VERCEL_TOKEN environment variable is required');
    console.error('   Get it from: https://vercel.com/account/tokens');
    console.error('   Usage: VERCEL_TOKEN=xxx node scripts/audit-vercel-env.ts');
    process.exit(1);
  }

  try {
    runVercelCommand('--version');
  } catch {
    console.error(' Vercel CLI not found. Install it with: npm i -g vercel');
    process.exit(1);
  }

  // Load local environment for comparison
  const localEnv = loadLocalEnv();

  // Fetch environments
  const environments: Array<'production' | 'preview' | 'development'> = [
    'production',
    'preview',
    'development',
  ];
  const results: Record<string, EnvAuditResult> = {};

  for (const env of environments) {
    console.log(`\n Fetching ${env} environment variables...`);
    const envVars = fetchVercelEnvs(env);

    if (envVars.length === 0) {
      console.log(`  No variables found for ${env} environment`);
      continue;
    }

    const result = analyzeEnvironment(envVars, env, localEnv);
    results[env] = result;

    const localComparison = env === 'development' ? compareWithLocal(envVars, localEnv) : undefined;
    printReport(env, result, localComparison);
  }

  // Print fix suggestions
  printFixSuggestions(results);

  console.log(`\n${'='.repeat(60)}`);
  console.log(` AUDIT COMPLETE`);
  console.log(`${'='.repeat(60)}`);
  console.log(`\n NEXT STEPS:`);
  console.log(`   1. Fix missing variables in Vercel Dashboard`);
  console.log(`   2. Update Clerk domain settings if needed`);
  console.log(`   3. Restart deployments to pick up new environment variables`);
  console.log(`   4. Test authentication on each environment`);
}

main().catch((error) => {
  console.error(' Audit failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});*/
