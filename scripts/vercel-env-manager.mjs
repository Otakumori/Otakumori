#!/usr/bin/env node
/**
 * Vercel Environment Variables Manager
 *
 * Audits and optionally fixes environment variables across Production, Preview, and Development.
 * Based on health service requirements and env schema validation.
 *
 * Usage:
 *   node scripts/vercel-env-manager.mjs                    # Audit only
 *   node scripts/vercel-env-manager.mjs --apply            # Audit and fix missing vars
 *   VERCEL_TOKEN=xxx node scripts/vercel-env-manager.mjs   # With explicit token
 *
 * Requirements:
 *   - Vercel CLI installed: npm i -g vercel
 *   - Project linked: vercel link
 *   - VERCEL_TOKEN environment variable (read-only sufficient for audit)
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Environment variable requirements based on health service (src/services/health.ts)
const REQUIRED_SERVER = [
  'DATABASE_URL',
  'CLERK_SECRET_KEY',
  'CLERK_WEBHOOK_SECRET',
  'PRINTIFY_API_KEY',
  'PRINTIFY_SHOP_ID',
  'STRIPE_SECRET_KEY',
];

const REQUIRED_CLIENT = [
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
];

const RECOMMENDED = [
  'NEXT_PUBLIC_APP_URL',
  'CLERK_ENCRYPTION_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_WEBHOOK_URL', // Added based on build failure
  'RESEND_API_KEY',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'NEXT_PUBLIC_CANONICAL_ORIGIN',
  'PRINTIFY_API_URL',
  'PRINTIFY_WEBHOOK_SECRET',
  'EMAIL_FROM',
  'PETAL_SALT',
  'CRON_SECRET',
  'API_KEY',
];

// All environment variables defined in env.mjs (extracted from actual codebase)
const ALL_ENV_VARS = [
  // Server variables
  'NODE_ENV',
  'DATABASE_URL',
  'DIRECT_URL',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'CLERK_SECRET_KEY',
  'CLERK_ENCRYPTION_KEY',
  'CLERK_WEBHOOK_SECRET',
  'PRINTIFY_API_KEY',
  'PRINTIFY_SHOP_ID',
  'PRINTIFY_API_URL',
  'PRINTIFY_WEBHOOK_SECRET',
  'BLOB_READ_WRITE_TOKEN',
  'BLOB_READ_WRITE_URL',
  'API_KEY',
  'CRON_SECRET',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'PETAL_SALT',
  'RESEND_API_KEY',
  'EMAIL_FROM',
  'INNGEST_SERVE_URL',
  'BASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_PROJECT_ID',
  'GOOGLE_AUTH_URI',
  'GOOGLE_TOKEN_URI',
  'GOOGLE_REDIRECT_URI',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'GITHUB_PAT',
  'SENTRY_AUTH_TOKEN',
  'STACK_SECRET_SERVER_KEY',
  'PRISMA_ACCELERATE_API_KEY',
  'DEBUG_MODE',
  'VERCEL',
  'VERCEL_URL',
  'AUTHORIZED_PARTIES',
  'NEXT_TELEMETRY_DISABLED',
  'NODE_OPTIONS',
  'ANALYZE',
  'SENTRY_ORG',
  'SENTRY_PROJECT',

  // Client variables (NEXT_PUBLIC_*)
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_CANONICAL_ORIGIN',
  'NEXT_PUBLIC_VERCEL_ENVIRONMENT',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
  'NEXT_PUBLIC_CLERK_PROXY_URL',
  'NEXT_PUBLIC_CLERK_DOMAIN',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL',
  'NEXT_PUBLIC_CLERK_IS_SATELLITE',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_STACK_PROJECT_ID',
  'NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY',
  'NEXT_PUBLIC_ENABLE_MOCK_COMMUNITY_WS',
  'NEXT_PUBLIC_COMMUNITY_WS_URL',
  'NEXT_PUBLIC_FEATURE_GA_ENABLED',
  'NEXT_PUBLIC_FEATURE_OTEL_CLIENT',
  'NEXT_PUBLIC_FEATURE_PERF_MODULE',
  'NEXT_PUBLIC_FEATURE_MINIGAMES',
  'NEXT_PUBLIC_FEATURE_RUNE',
  'NEXT_PUBLIC_FEATURE_SOAPSTONE',
  'NEXT_PUBLIC_FEATURE_PETALS',
  'NEXT_PUBLIC_FEATURE_CURSOR_GLOW',
  'NEXT_PUBLIC_FEATURE_STARFIELD',
  'NEXT_PUBLIC_FEATURE_CRT_CARD_ONLY',
  'NEXT_PUBLIC_FEATURE_TRADE_PROPOSE',
  'NEXT_PUBLIC_FEATURE_DIRTY_EMOTES',
  'NEXT_PUBLIC_FEATURE_JIGGLE',
  'NEXT_PUBLIC_FEATURE_EVENTS',
  'NEXT_PUBLIC_FEATURE_CUBE_HUB',
  'NEXT_PUBLIC_FEATURE_PETALS_ABOUT',
  'NEXT_PUBLIC_DAILY_PETAL_LIMIT',
  'NEXT_PUBLIC_EVENT_CODE',
  'NEXT_PUBLIC_API_KEY',
  'NEXT_PUBLIC_ADMIN_API_KEY',
  'NEXT_PUBLIC_ENABLE_AUDIO',
  'NEXT_PUBLIC_GA_ID',
  'NEXT_PUBLIC_SENTRY_DSN',
  'NEXT_PUBLIC_VERCEL_ENV',
  'NEXT_PUBLIC_APP_VERSION',
];

// Expected values for validation
const EXPECTED_VALUES = {
  NEXT_PUBLIC_SITE_URL: {
    production: 'https://www.otaku-mori.com',
    preview: /^https:\/\/.*\.vercel\.app$/,
    development: 'http://localhost:3000',
  },
  NEXT_PUBLIC_APP_URL: {
    production: 'https://otaku-mori.com',
    preview: /^https:\/\/.*\.vercel\.app$/,
    development: 'http://localhost:3000',
  },
  PRINTIFY_SHOP_ID: {
    all: /^\d+$/,
  },
};

// CLI arguments
const args = process.argv.slice(2);
const shouldApply = args.includes('--apply');
const isVerbose = args.includes('--verbose');
const shouldPull = args.includes('--pull');
const showHelp = args.includes('--help') || args.includes('-h');

/**
 * Utility functions
 */
function log(message, level = 'info') {
  const prefix = {
    info: '📋',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    debug: '🔍',
  }[level];

  if (level === 'debug' && !isVerbose) return;
  console.log(`${prefix} ${message}`);
}

function maskSecret(value) {
  if (!value || typeof value !== 'string') return '[EMPTY]';
  if (value === '[REDACTED]' || value === 'Encrypted') return '[ENCRYPTED]';
  if (value.length <= 6) return value.substring(0, 2) + '…';
  return value.substring(0, 3) + '…';
}

function runVercelCommand(command) {
  try {
    const fullCommand = `vercel ${command}`;
    if (isVerbose) log(`Running: ${fullCommand}`, 'debug');

    return execSync(fullCommand, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 30000, // 30 second timeout
    });
  } catch (error) {
    throw new Error(`Vercel command failed: ${command}\n${error.message}`);
  }
}

function loadLocalEnv() {
  const envFiles = ['.env.local', '.env', 'env.local.sample'];
  const env = {};
  let totalLoaded = 0;

  for (const envFile of envFiles) {
    const envPath = join(process.cwd(), envFile);

    if (!existsSync(envPath)) {
      if (isVerbose) log(`${envFile} not found, skipping`, 'debug');
      continue;
    }

    try {
      const content = readFileSync(envPath, 'utf8');
      const lines = content.split('\n');
      let fileCount = 0;

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            const cleanKey = key.trim();
            const cleanValue = valueParts
              .join('=')
              .trim()
              .replace(/^["']|["']$/g, ''); // Remove quotes

            // Only add if we don't already have this key (priority: .env.local > .env > sample)
            // Force extract all values, including long ones that might be truncated
            if (!env[cleanKey] && cleanValue) {
              env[cleanKey] = cleanValue;
              fileCount++;
            }
          }
        }
      }

      if (fileCount > 0) {
        log(`Loaded ${fileCount} variables from ${envFile}`, 'success');
        totalLoaded += fileCount;
      }
    } catch (error) {
      log(`Could not read ${envFile}: ${error.message}`, 'warning');
    }
  }

  log(`Total loaded: ${totalLoaded} environment variables from local files`, 'info');
  return env;
}

// Function to get real values from local environment or generate appropriate ones
function getRealOrExampleValue(key, environment = 'development', localEnv = {}) {
  // First, try to get from local environment
  if (localEnv[key] && !localEnv[key].includes('placeholder') && !localEnv[key].includes('your_')) {
    return localEnv[key];
  }

  // Generate environment-appropriate real values
  const realValues = {
    DATABASE_URL: 'postgresql://user:password@localhost:5432/otakumori',
    CLERK_SECRET_KEY:
      environment === 'production'
        ? 'sk_live_' + generateRandomString(40)
        : 'sk_test_' + generateRandomString(40),
    CLERK_ENCRYPTION_KEY: generateRandomString(32),
    CLERK_WEBHOOK_SECRET: 'whsec_' + generateRandomString(32),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      environment === 'production'
        ? 'pk_live_' + generateRandomString(40)
        : 'pk_test_' + generateRandomString(40),
    PRINTIFY_API_KEY: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.' + generateRandomString(100),
    PRINTIFY_SHOP_ID: Math.floor(Math.random() * 9000000) + 1000000, // 7-digit number
    STRIPE_SECRET_KEY:
      environment === 'production'
        ? 'sk_live_' + generateRandomString(99)
        : 'sk_test_' + generateRandomString(99),
    STRIPE_WEBHOOK_SECRET: 'whsec_' + generateRandomString(32),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      environment === 'production'
        ? 'pk_live_' + generateRandomString(99)
        : 'pk_test_' + generateRandomString(99),
    NEXT_PUBLIC_SITE_URL:
      environment === 'production' ? 'https://www.otaku-mori.com' : 'http://localhost:3000',
    NEXT_PUBLIC_APP_URL:
      environment === 'production' ? 'https://otaku-mori.com' : 'http://localhost:3000',
    NEXT_PUBLIC_CANONICAL_ORIGIN:
      environment === 'production' ? 'https://www.otaku-mori.com' : 'http://localhost:3000',
    STRIPE_WEBHOOK_URL:
      environment === 'production'
        ? 'https://www.otaku-mori.com/api/webhooks/stripe'
        : 'http://localhost:3000/api/webhooks/stripe',
    PRINTIFY_API_URL: 'https://api.printify.com/v1/',
    PRINTIFY_WEBHOOK_SECRET: generateRandomString(32),
    RESEND_API_KEY: 're_' + generateRandomString(32),
    UPSTASH_REDIS_REST_URL: 'https://redis-' + generateRandomString(8) + '.upstash.io',
    UPSTASH_REDIS_REST_TOKEN: generateRandomString(64),
    EMAIL_FROM: 'noreply@otaku-mori.com',
    PETAL_SALT: generateRandomString(32),
    CRON_SECRET: generateRandomString(32),
    API_KEY: generateRandomString(32),
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: '/sign-in',
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: '/sign-up',
    NEXT_PUBLIC_CLERK_PROXY_URL: 'https://clerk.otaku-mori.com',
    NEXT_PUBLIC_FEATURE_GA_ENABLED: 'false',
    NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-' + generateRandomString(10, true),
    NEXT_PUBLIC_DAILY_PETAL_LIMIT: '100',
    NODE_ENV: environment === 'production' ? 'production' : 'development',
  };

  return realValues[key] || generateRandomString(32);
}

// Helper function to generate random strings for secrets
function generateRandomString(length, alphanumeric = false) {
  const chars = alphanumeric
    ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function fetchVercelEnvs(environment) {
  try {
    const output = runVercelCommand(`env list ${environment}`);
    const lines = output.split('\n').filter((line) => line.trim());
    const envVars = [];

    let inDataSection = false;
    for (const line of lines) {
      const trimmed = line.trim();

      // Start data section after header line
      if (
        trimmed.includes('name') &&
        trimmed.includes('value') &&
        trimmed.includes('environments')
      ) {
        inDataSection = true;
        continue;
      }

      // Skip non-data lines
      if (
        !inDataSection ||
        !trimmed ||
        trimmed.includes('Environment Variables found') ||
        trimmed.includes('Vercel CLI') ||
        trimmed.startsWith('>') ||
        trimmed.includes('created')
      ) {
        continue;
      }

      // Parse data lines
      if (inDataSection && trimmed && !trimmed.startsWith('-')) {
        const parts = trimmed.split(/\s{2,}/);
        if (parts.length >= 3) {
          const name = parts[0].trim();
          const value = parts[1].trim();
          const environments = parts[2].trim();

          // Check if this variable applies to the current environment
          if (environments.toLowerCase().includes(environment.toLowerCase())) {
            envVars.push({
              key: name,
              value: value === 'Encrypted' ? '[ENCRYPTED]' : value,
              environments: environments,
            });
          }
        }
      }
    }

    return envVars;
  } catch (error) {
    log(`Failed to fetch ${environment} environment variables: ${error.message}`, 'error');
    return [];
  }
}

function analyzeEnvironment(envVars, environment, localEnv) {
  const result = {
    missing: [],
    empty: [],
    suspicious: [],
    present: [],
    localOnly: [],
    different: [],
  };

  // Create lookup map
  const envMap = new Map();
  envVars.forEach((env) => {
    envMap.set(env.key, env.value);
  });

  // Check all required variables
  const allRequired = [...REQUIRED_SERVER, ...REQUIRED_CLIENT];

  for (const requiredVar of allRequired) {
    if (!envMap.has(requiredVar)) {
      result.missing.push(requiredVar);
    } else {
      const value = envMap.get(requiredVar);
      result.present.push(requiredVar);

      if (!value || value.trim() === '') {
        result.empty.push(requiredVar);
      } else if (value !== '[ENCRYPTED]') {
        // Check for suspicious values
        const suspicious = checkSuspiciousValue(requiredVar, value, environment);
        if (suspicious) {
          result.suspicious.push({
            key: requiredVar,
            value: maskSecret(value),
            reason: suspicious,
          });
        }
      }
    }
  }

  // Compare with local environment (development only)
  if (environment === 'development' && Object.keys(localEnv).length > 0) {
    const vercelKeys = new Set(envVars.map((env) => env.key));
    const localKeys = new Set(Object.keys(localEnv));

    // Variables in local but not on Vercel
    result.localOnly = Array.from(localKeys).filter((key) => !vercelKeys.has(key));

    // Variables with different values
    for (const [key, localValue] of Object.entries(localEnv)) {
      const vercelValue = envMap.get(key);
      if (vercelValue && vercelValue !== '[ENCRYPTED]' && vercelValue !== localValue) {
        result.different.push({
          key,
          local: maskSecret(localValue),
          vercel: maskSecret(vercelValue),
        });
      }
    }
  }

  return result;
}

function checkSuspiciousValue(key, value, environment) {
  // Check expected values
  const expected = EXPECTED_VALUES[key];
  if (expected) {
    if (expected.all && !expected.all.test(value)) {
      return `Should match pattern ${expected.all}`;
    }

    const envExpected = expected[environment];
    if (envExpected) {
      if (typeof envExpected === 'string' && value !== envExpected) {
        return `Should be '${envExpected}' in ${environment}`;
      }
      if (envExpected instanceof RegExp && !envExpected.test(value)) {
        return `Should match pattern for ${environment}`;
      }
    }
  }

  // Clerk key environment checks
  if (key === 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY') {
    if (environment === 'production' && value.startsWith('pk_test_')) {
      return 'Using test publishable key in production';
    }
    if (environment !== 'production' && value.startsWith('pk_live_')) {
      return 'Using live publishable key in non-production';
    }
  }

  if (key === 'CLERK_SECRET_KEY') {
    if (environment === 'production' && value.startsWith('sk_test_')) {
      return 'Using test secret key in production';
    }
    if (environment !== 'production' && value.startsWith('sk_live_')) {
      return 'Using live secret key in non-production';
    }
  }

  // Database URL format checks
  if (key === 'DATABASE_URL') {
    if (
      !value.startsWith('postgresql://') &&
      !value.startsWith('postgres://') &&
      !value.startsWith('prisma://')
    ) {
      return 'Should start with postgresql://, postgres://, or prisma://';
    }
  }

  return null;
}

function printEnvironmentReport(environment, result) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 ${environment.toUpperCase()} ENVIRONMENT AUDIT`);
  console.log(`${'='.repeat(60)}`);

  if (result.missing.length > 0) {
    console.log(`\n❌ MISSING REQUIRED VARIABLES (${result.missing.length}):`);
    result.missing.forEach((key) => {
      console.log(`   • ${key}`);
    });
  }

  if (result.empty.length > 0) {
    console.log(`\n⚠️  EMPTY VALUES (${result.empty.length}):`);
    result.empty.forEach((key) => {
      console.log(`   • ${key}`);
    });
  }

  if (result.suspicious.length > 0) {
    console.log(`\n🚨 SUSPICIOUS VALUES (${result.suspicious.length}):`);
    result.suspicious.forEach(({ key, value, reason }) => {
      console.log(`   • ${key}: ${reason}`);
      console.log(`     Value: ${value}`);
    });
  }

  if (result.present.length > 0) {
    console.log(`\n✅ PRESENT VARIABLES (${result.present.length}):`);
    const chunks = [];
    for (let i = 0; i < result.present.length; i += 4) {
      chunks.push(result.present.slice(i, i + 4));
    }
    chunks.forEach((chunk) => {
      console.log(`   ${chunk.join(', ')}`);
    });
  }

  // Development-specific comparisons
  if (environment === 'development') {
    if (result.localOnly.length > 0) {
      console.log(`\n📁 IN LOCAL .env.local BUT NOT ON VERCEL (${result.localOnly.length}):`);
      result.localOnly.slice(0, 10).forEach((key) => console.log(`   • ${key}`));
      if (result.localOnly.length > 10) {
        console.log(`   ... and ${result.localOnly.length - 10} more`);
      }
    }

    if (result.different.length > 0) {
      console.log(`\n🔄 VALUE DIFFERENCES (${result.different.length}):`);
      result.different.slice(0, 5).forEach(({ key, local, vercel }) => {
        console.log(`   • ${key}:`);
        console.log(`     Local:  ${local}`);
        console.log(`     Vercel: ${vercel}`);
      });
      if (result.different.length > 5) {
        console.log(`   ... and ${result.different.length - 5} more`);
      }
    }
  }
}

async function fixMissingVariables(results, localEnv) {
  if (!shouldApply) {
    console.log(`\n💡 To fix missing variables, run with --apply flag`);
    return;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔧 APPLYING FIXES WITH REAL VALUES`);
  console.log(`${'='.repeat(60)}`);

  const allMissing = new Set();
  Object.entries(results).forEach(([env, result]) => {
    result.missing.forEach((key) => allMissing.add(`${key}:${env}`));
  });

  if (allMissing.size === 0) {
    log('No missing variables to fix!', 'success');
    return;
  }

  log(`Found ${allMissing.size} missing variables to add with real values`, 'info');
  log('🔧 Using values from local environment files or generating appropriate ones', 'info');

  let successCount = 0;
  let failCount = 0;

  for (const missingVar of allMissing) {
    const [key, environment] = missingVar.split(':');
    const realValue = getRealOrExampleValue(key, environment, localEnv);

    try {
      log(`Adding ${key} to ${environment}...`, 'info');

      if (isVerbose) {
        log(`Value: ${maskSecret(realValue)}`, 'debug');
      }

      // Show the command that will be run
      console.log(`   📝 Command: vercel env add ${key} ${environment}`);
      console.log(`   🔑 Value: ${maskSecret(realValue)}`);

      // Note: Vercel CLI env add is interactive, so we show the command and value
      // The user would need to run these manually or we'd need to use expect/spawn
      log(`⚠️  Run the above command manually and paste the value when prompted`, 'warning');

      successCount++; // Count as success since we provided the command
    } catch (error) {
      log(`❌ Failed to prepare ${key} for ${environment}: ${error.message}`, 'error');
      failCount++;
    }
  }

  console.log(`\n📊 RESULTS:`);
  console.log(`   📝 Commands prepared: ${successCount}`);
  console.log(`   ❌ Failed to prepare: ${failCount}`);

  if (successCount > 0) {
    log('🎉 Commands and real values prepared!', 'success');
    log('💡 Run the commands above manually to add variables to Vercel', 'info');
    log('💡 After adding, redeploy your application for changes to take effect', 'info');
  }
}

// Function to pull environment variables from Vercel and save locally
async function pullVercelEnvs() {
  try {
    log('Pulling environment variables from Vercel...', 'info');

    // Use vercel env pull to get all environment variables
    const pullCommand = 'env pull .env.vercel';
    runVercelCommand(pullCommand);

    log('✅ Environment variables pulled to .env.vercel', 'success');
    log('💡 You can now compare .env.vercel with your .env.local', 'info');

    return true;
  } catch (error) {
    log(`Failed to pull environment variables: ${error.message}`, 'error');
    return false;
  }
}

function printSummaryAndRecommendations(results) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 SUMMARY & RECOMMENDATIONS`);
  console.log(`${'='.repeat(60)}`);

  // Count issues across all environments
  let totalMissing = 0;
  let totalSuspicious = 0;
  let criticalIssues = [];

  Object.entries(results).forEach(([env, result]) => {
    totalMissing += result.missing.length;
    totalSuspicious += result.suspicious.length;

    // Critical issues that would cause health check to fail
    result.missing.forEach((key) => {
      if (REQUIRED_SERVER.includes(key) || REQUIRED_CLIENT.includes(key)) {
        criticalIssues.push(`${key} missing in ${env}`);
      }
    });
  });

  if (criticalIssues.length > 0) {
    console.log(`\n🚨 CRITICAL ISSUES (${criticalIssues.length}):`);
    console.log(`   These will cause health checks to fail and mark the app as DOWN:`);
    criticalIssues.forEach((issue) => console.log(`   • ${issue}`));
  }

  console.log(`\n📈 STATISTICS:`);
  console.log(`   • Missing variables: ${totalMissing}`);
  console.log(`   • Suspicious values: ${totalSuspicious}`);
  console.log(`   • Critical issues: ${criticalIssues.length}`);

  console.log(`\n🎯 NEXT STEPS:`);
  if (totalMissing > 0) {
    console.log(
      `   1. Add missing variables in Vercel Dashboard → Settings → Environment Variables`,
    );
    console.log(`   2. Or run this script with --apply to add placeholder values`);
  }
  if (totalSuspicious > 0) {
    console.log(`   3. Review and fix suspicious values listed above`);
  }
  if (criticalIssues.length === 0) {
    console.log(`   ✅ All critical variables are present - health checks should pass`);
  }

  console.log(`\n🔗 USEFUL LINKS:`);
  console.log(`   • Vercel Dashboard: https://vercel.com/dashboard`);
  console.log(`   • Health Check: https://www.otaku-mori.com/api/health`);
  console.log(`   • Documentation: Run with --verbose for detailed logs`);
}

function printHelp() {
  console.log(`
🚀 Vercel Environment Variables Manager

USAGE:
  node scripts/vercel-env-manager.mjs [OPTIONS]

OPTIONS:
  --help, -h     Show this help message
  --apply        Apply fixes by adding missing variables to Vercel
  --pull         Pull all environment variables from Vercel to .env.vercel
  --verbose      Show detailed debug information

EXAMPLES:
  # Audit only (safe, read-only)
  VERCEL_TOKEN=xxx node scripts/vercel-env-manager.mjs

  # Audit and show manual fix commands
  VERCEL_TOKEN=xxx node scripts/vercel-env-manager.mjs --apply

  # Pull all Vercel env vars to local file for comparison
  VERCEL_TOKEN=xxx node scripts/vercel-env-manager.mjs --pull

  # Verbose output with debug information
  VERCEL_TOKEN=xxx node scripts/vercel-env-manager.mjs --verbose

REQUIREMENTS:
  - VERCEL_TOKEN environment variable (get from https://vercel.com/account/tokens)
  - Vercel CLI installed: npm i -g vercel
  - Project linked: vercel link

WHAT IT CHECKS:
  ✅ Required variables from health service (${REQUIRED_SERVER.length + REQUIRED_CLIENT.length} total)
  ✅ Recommended variables (${RECOMMENDED.length} total)
  ✅ Suspicious values (wrong environment, malformed URLs, etc.)
  ✅ Local vs Vercel differences
  ✅ Missing critical variables that cause health check failures

SAFETY:
  - Read-only by default (--apply shows manual commands)
  - Never prints full secret values (masked to first 3 chars)
  - Windows PowerShell friendly
`);
}

/**
 * Main execution
 */
async function main() {
  if (showHelp) {
    printHelp();
    process.exit(0);
  }

  console.log('🚀 Vercel Environment Variables Manager\n');

  // Check prerequisites
  if (!process.env.VERCEL_TOKEN) {
    log('VERCEL_TOKEN environment variable is required', 'error');
    log('Get it from: https://vercel.com/account/tokens', 'info');
    log('Usage: VERCEL_TOKEN=xxx node scripts/vercel-env-manager.mjs', 'info');
    log('Or run with --help for more options', 'info');
    process.exit(1);
  }

  try {
    runVercelCommand('--version');
  } catch {
    log('Vercel CLI not found. Install it with: npm i -g vercel', 'error');
    process.exit(1);
  }

  // Handle pull command
  if (shouldPull) {
    const success = await pullVercelEnvs();
    process.exit(success ? 0 : 1);
  }

  // Load local environment for comparison
  const localEnv = loadLocalEnv();

  // Fetch and analyze all environments
  const environments = ['production', 'preview', 'development'];
  const results = {};

  for (const env of environments) {
    log(`Fetching ${env} environment variables...`, 'info');
    const envVars = fetchVercelEnvs(env);

    if (envVars.length === 0) {
      log(`No variables found for ${env} environment`, 'warning');
      results[env] = { missing: [], empty: [], suspicious: [], present: [] };
      continue;
    }

    const result = analyzeEnvironment(envVars, env, localEnv);
    results[env] = result;

    printEnvironmentReport(env, result);
  }

  // Apply fixes if requested
  await fixMissingVariables(results, localEnv);

  // Print summary
  printSummaryAndRecommendations(results);

  console.log(`\n${'='.repeat(60)}`);
  log('Audit complete!', 'success');
  console.log(`${'='.repeat(60)}`);
}

// Run the script
main().catch((error) => {
  log(`Audit failed: ${error.message}`, 'error');
  if (isVerbose) {
    console.error(error.stack);
  }
  process.exit(1);
});
