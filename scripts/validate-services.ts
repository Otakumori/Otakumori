#!/usr/bin/env tsx
/**
 * Service Validation Script
 * Tests that your API keys actually work
 */

import { existsSync, readFileSync } from 'node:fs';
import { lookup } from 'node:dns/promises';
import { resolve } from 'node:path';
import { parse } from 'dotenv';
import {
  evaluateDeployedRuntimeProof,
  parseRuntimeConfigProof,
  parseRuntimeHealthProof,
  type RuntimeConfigProof,
  type RuntimeHealthProof,
} from '@/lib/commerce/runtime-config-proof';

const DEFAULT_PRINTIFY_API_URL = 'https://api.printify.com/v1';

for (const file of ['.env.local', '.env']) {
  const path = resolve(process.cwd(), file);
  if (!existsSync(path)) continue;

  const parsed = parse(readFileSync(path));
  for (const [key, value] of Object.entries(parsed)) {
    process.env[key] ??= value;
  }
}

const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  FULFILLMENT_PROVIDER: process.env.FULFILLMENT_PROVIDER,
  FULFILLMENT_DRY_RUN: process.env.FULFILLMENT_DRY_RUN,
  STRIPE_WEBHOOK_FULFILLMENT_DRY_RUN: process.env.STRIPE_WEBHOOK_FULFILLMENT_DRY_RUN,
  PRINTIFY_API_KEY: process.env.PRINTIFY_API_KEY,
  PRINTIFY_SHOP_ID: process.env.PRINTIFY_SHOP_ID,
  PRINTIFY_API_URL: process.env.PRINTIFY_API_URL ?? DEFAULT_PRINTIFY_API_URL,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_ADMIN_API_KEY: process.env.RESEND_ADMIN_API_KEY,
  RESEND_ADMIN_KEY: process.env.RESEND_ADMIN_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  VERCEL_ENV: process.env.VERCEL_ENV,
};

interface ValidationResult {
  service: string;
  status: 'pass' | 'fail' | 'skip' | 'warn';
  message: string;
  details?: string;
  action?: string;
}

const results: ValidationResult[] = [];
const strict = process.argv.includes('--strict');
const readinessMode =
  (process.env.RUNTIME_READINESS_MODE ?? 'local-env').trim().toLowerCase() === 'deployed-runtime'
    ? 'deployed-runtime'
    : 'local-env';

function normalizeBaseUrl(value: string | undefined, fallback: string) {
  return (value || fallback).trim().replace(/\/+$/, '');
}

function safeHost(value: string) {
  try {
    return new URL(value).host;
  } catch {
    return 'invalid-url';
  }
}

function hasEdgeWhitespace(value: string | undefined) {
  return typeof value === 'string' && value !== value.trim();
}

async function canResolveHostname(hostname: string) {
  if (!hostname) return false;

  try {
    await lookup(hostname);
    return true;
  } catch {
    return false;
  }
}

async function redisFetchFailureDetails(redisUrl: string) {
  try {
    const parsed = new URL(redisUrl);
    const dnsResolves = await canResolveHostname(parsed.hostname);
    return [
      'category=FETCH_FAILED',
      'urlParses=true',
      `protocol=${parsed.protocol.replace(':', '')}`,
      `hostnamePresent=${Boolean(parsed.hostname)}`,
      `dnsResolves=${dnsResolves}`,
    ].join(' | ');
  } catch {
    return 'category=FETCH_FAILED | urlParses=false';
  }
}

function redisHttpFailureAction(status: number) {
  if (status === 401) return 'Check that UPSTASH_REDIS_REST_TOKEN belongs to this Redis REST URL.';
  if (status === 403) return 'Check token permissions and that the database is active.';
  if (status === 404)
    return 'Check that UPSTASH_REDIS_REST_URL is the base HTTPS REST endpoint, without /ping.';
  if (status >= 500) return 'Check Upstash service status and the selected Redis database health.';
  return 'Check UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN pairing.';
}

function redisHttpFailureCategory(status: number) {
  if (status === 401) return 'HTTP_401';
  if (status === 403) return 'HTTP_403';
  if (status === 404) return 'HTTP_404';
  if (status >= 500) return 'HTTP_5XX';
  return `HTTP_${status}`;
}

async function parseRedisPingResponse(response: Response) {
  const body = await response.text();

  try {
    const parsed = JSON.parse(body) as { result?: unknown };
    return parsed?.result === 'PONG';
  } catch {
    return body.trim() === 'PONG';
  }
}

async function validateClerk() {
  console.log('[Auth] Testing Clerk Authentication...');
  if (!env.CLERK_SECRET_KEY) {
    results.push({
      service: 'Clerk',
      status: 'fail',
      message: 'Clerk API key is missing',
      action: 'Set CLERK_SECRET_KEY for this environment.',
    });
    return;
  }

  try {
    const response = await fetch(`https://api.clerk.com/v1/users?limit=1`, {
      headers: {
        Authorization: `Bearer ${env.CLERK_SECRET_KEY}`,
      },
    });

    if (response.ok) {
      results.push({
        service: 'Clerk',
        status: 'pass',
        message: 'Success Clerk API key is valid',
      });
    } else {
      const error = await response.text();
      results.push({
        service: 'Clerk',
        status: 'fail',
        message: 'Failed Clerk API key is invalid',
        details: `HTTP ${response.status}: ${error.substring(0, 100)}`,
      });
    }
  } catch (error) {
    results.push({
      service: 'Clerk',
      status: 'fail',
      message: 'Failed Failed to connect to Clerk',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

async function validateStripe() {
  console.log('[Stripe] Testing Stripe...');
  if (!env.STRIPE_SECRET_KEY) {
    results.push({
      service: 'Stripe',
      status: 'fail',
      message: 'Stripe API key is missing',
      action: 'Set STRIPE_SECRET_KEY for this environment.',
    });
    return;
  }

  try {
    const response = await fetch('https://api.stripe.com/v1/balance', {
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      },
    });

    if (response.ok) {
      const balance = (await response.json()) as {
        available?: Array<{ amount: number; currency: string }>;
        pending?: Array<{ amount: number; currency: string }>;
      };
      const primaryAvailable = balance.available?.[0];
      const stripeMode = env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'LIVE' : 'TEST';
      const target = (process.env.APP_ENV_TARGET ?? env.VERCEL_ENV ?? '').toLowerCase();
      if (target === 'preview' && stripeMode === 'LIVE') {
        results.push({
          service: 'Stripe',
          status: 'fail',
          message: 'Stripe Preview readiness cannot use LIVE mode',
          details: 'Mode: LIVE | target=preview',
          action: 'Use Stripe TEST keys for Preview readiness.',
        });
        return;
      }

      results.push({
        service: 'Stripe',
        status: 'pass',
        message: 'Stripe API key is valid',
        details: [
          `Mode: ${stripeMode}`,
          primaryAvailable
            ? `Available balance: ${primaryAvailable.amount} ${primaryAvailable.currency}`
            : undefined,
        ]
          .filter(Boolean)
          .join(' | '),
      });
    } else {
      const errorText = await response.text();
      results.push({
        service: 'Stripe',
        status: 'fail',
        message: 'Stripe API key is invalid',
        details: `HTTP ${response.status}: ${errorText.substring(0, 120)}`,
      });
    }
  } catch (error) {
    results.push({
      service: 'Stripe',
      status: 'fail',
      message: 'Failed to connect to Stripe',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

function validateFulfillmentConfig() {
  console.log('[Fulfillment] Checking fulfillment configuration...');
  const provider = env.FULFILLMENT_PROVIDER ?? 'manual';
  const dryRun = (env.FULFILLMENT_DRY_RUN ?? env.STRIPE_WEBHOOK_FULFILLMENT_DRY_RUN ?? 'false')
    .trim()
    .toLowerCase();

  if (!['printify', 'merchize', 'manual', 'disabled'].includes(provider)) {
    results.push({
      service: 'Fulfillment',
      status: 'fail',
      message: 'Fulfillment provider is invalid',
      details: 'provider=invalid',
      action: 'Use FULFILLMENT_PROVIDER=printify, manual, disabled, or merchize.',
    });
    return;
  }

  if (dryRun && !['true', 'false', '1', '0'].includes(dryRun)) {
    results.push({
      service: 'Fulfillment',
      status: 'fail',
      message: 'Fulfillment dry-run flag is invalid',
      details: 'FULFILLMENT_DRY_RUN must be true, false, 1, or 0',
      action:
        'Set FULFILLMENT_DRY_RUN=true for safe Preview webhook proof, or false/unset for normal behavior.',
    });
    return;
  }

  if (provider === 'merchize') {
    results.push({
      service: 'Fulfillment',
      status: 'warn',
      message: 'Merchize fulfillment is stubbed for manual review',
      details: 'provider=merchize | writesProvider=false',
      action: 'Keep Merchize orders in manual review until the live order API shape is confirmed.',
    });
    return;
  }

  results.push({
    service: 'Fulfillment',
    status: 'pass',
    message: 'Fulfillment configuration is readable',
    details: `provider=${provider} | dryRun=${dryRun === 'true' || dryRun === '1'}`,
  });
}

async function validatePrintify() {
  console.log('[Printify] Testing Printify...');
  if (!env.PRINTIFY_API_KEY || !env.PRINTIFY_SHOP_ID) {
    results.push({
      service: 'Printify',
      status: 'skip',
      message: 'Printify not configured',
      details: `hasToken=${Boolean(env.PRINTIFY_API_KEY)} | hasShopId=${Boolean(env.PRINTIFY_SHOP_ID)}`,
      action: 'Set PRINTIFY_API_KEY and PRINTIFY_SHOP_ID.',
    });
    return;
  }

  const baseUrl = normalizeBaseUrl(env.PRINTIFY_API_URL, 'https://api.printify.com/v1');
  const headers = {
    Authorization: `Bearer ${env.PRINTIFY_API_KEY}`,
  };

  try {
    const shopsResponse = await fetch(`${baseUrl}/shops.json`, { headers });

    if (!shopsResponse.ok) {
      results.push({
        service: 'Printify',
        status: 'fail',
        message: 'Printify shop list probe failed',
        details: `HTTP ${shopsResponse.status} | baseUrlHost=${safeHost(baseUrl)} | endpoint=/shops.json`,
        action:
          shopsResponse.status === 401 || shopsResponse.status === 403
            ? 'Check PRINTIFY_API_KEY.'
            : 'Check PRINTIFY_API_URL and Printify API availability.',
      });
      return;
    }

    const shops = (await shopsResponse.json()) as Array<{ id: string | number; title?: string }>;
    const configuredShop = shops.find((shop) => String(shop.id) === String(env.PRINTIFY_SHOP_ID));

    if (!configuredShop) {
      results.push({
        service: 'Printify',
        status: 'fail',
        message: 'Printify configured shop is not accessible',
        details: `code=PRINTIFY_SHOP_NOT_FOUND_OR_INACCESSIBLE | accessibleShopCount=${shops.length} | baseUrlHost=${safeHost(baseUrl)}`,
        action: 'Check PRINTIFY_SHOP_ID and token/shop access.',
      });
      return;
    }

    const productsResponse = await fetch(
      `${baseUrl}/shops/${env.PRINTIFY_SHOP_ID}/products.json?page=1&limit=1`,
      { headers },
    );

    if (productsResponse.ok) {
      results.push({
        service: 'Printify',
        status: 'pass',
        message: 'Printify API key and shop access are valid',
        details: `baseUrlHost=${safeHost(baseUrl)} | endpoint=/shops/{shopId}/products.json`,
      });
    } else {
      results.push({
        service: 'Printify',
        status: 'fail',
        message: 'Printify product probe failed',
        details: `HTTP ${productsResponse.status} | code=PRINTIFY_PRODUCTS_PROBE_FAILED | baseUrlHost=${safeHost(baseUrl)}`,
        action: 'Check PRINTIFY_SHOP_ID, token/shop access, and products endpoint access.',
      });
    }
  } catch (error) {
    results.push({
      service: 'Printify',
      status: 'fail',
      message: 'Failed to connect to Printify',
      details: error instanceof Error ? error.message : String(error),
      action: 'Check PRINTIFY_API_URL network reachability and token/shop configuration.',
    });
  }
}

async function validateDatabase() {
  console.log('[Database] Testing Database Connection...');
  if (!env.DATABASE_URL) {
    results.push({
      service: 'Database (Neon)',
      status: 'fail',
      message: 'DATABASE_URL is missing',
      action: 'Set DATABASE_URL for this environment.',
    });
    return;
  }

  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    await prisma.$queryRaw`SELECT 1`;

    const userCount = await prisma.user.count();
    results.push({
      service: 'Database (Neon)',
      status: 'pass',
      message: 'Database connection successful',
      details: `${userCount} users in database`,
    });

    await prisma.$disconnect();
  } catch (error) {
    results.push({
      service: 'Database (Neon)',
      status: 'fail',
      message: 'Database connection failed',
      details: error instanceof Error ? error.message : String(error),
      action:
        'Check DATABASE_URL formatting/target first. Schema drift is not proven until the connection succeeds.',
    });
  }
}

async function validateRedis() {
  console.log('[Redis] Testing Redis (Upstash)...');
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    results.push({
      service: 'Redis (Upstash)',
      status: 'skip',
      message: 'Redis not configured',
    });
    return;
  }

  try {
    const rawRedisUrl = env.UPSTASH_REDIS_REST_URL;
    const rawRedisToken = env.UPSTASH_REDIS_REST_TOKEN;
    const redisUrl = normalizeBaseUrl(rawRedisUrl, '');
    const url = new URL(redisUrl);

    if (url.protocol !== 'https:') {
      results.push({
        service: 'Redis (Upstash)',
        status: 'fail',
        message: 'Redis REST URL must use https',
        details: `protocol=${url.protocol.replace(':', '')}`,
        action: 'Use the Upstash REST API URL, not a redis:// or rediss:// connection string.',
      });
      return;
    }

    if (rawRedisUrl.trim().replace(/\/+$/, '').endsWith('/ping')) {
      results.push({
        service: 'Redis (Upstash)',
        status: 'fail',
        message: 'Redis REST URL should not include /ping',
        action: 'Set UPSTASH_REDIS_REST_URL to the base REST URL only.',
      });
      return;
    }

    if (redisUrl.includes(rawRedisToken.trim())) {
      results.push({
        service: 'Redis (Upstash)',
        status: 'fail',
        message: 'Redis REST URL must not include the token',
        action: 'Keep the token only in UPSTASH_REDIS_REST_TOKEN.',
      });
      return;
    }

    if (hasEdgeWhitespace(rawRedisUrl) || hasEdgeWhitespace(rawRedisToken)) {
      results.push({
        service: 'Redis (Upstash)',
        status: 'fail',
        message: 'Redis env values contain leading or trailing whitespace',
        action: 'Trim UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.',
      });
      return;
    }

    const response = await fetch(`${redisUrl}/ping`, {
      headers: {
        Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    });

    if (response.ok) {
      const hasExpectedBody = await parseRedisPingResponse(response);
      if (!hasExpectedBody) {
        results.push({
          service: 'Redis (Upstash)',
          status: 'fail',
          message: 'Redis ping returned an unexpected response',
          details: `category=UNEXPECTED_RESPONSE | status=${response.status}`,
          action: 'Check that UPSTASH_REDIS_REST_URL points to an Upstash Redis REST endpoint.',
        });
        return;
      }

      results.push({
        service: 'Redis (Upstash)',
        status: 'pass',
        message: 'Redis connection successful',
      });
    } else {
      results.push({
        service: 'Redis (Upstash)',
        status: 'fail',
        message: 'Redis connection failed',
        details: `category=${redisHttpFailureCategory(response.status)} | status=${response.status} | hostPresent=${safeHost(redisUrl) !== 'invalid-url'}`,
        action: redisHttpFailureAction(response.status),
      });
    }
  } catch (error) {
    const rawRedisUrl = env.UPSTASH_REDIS_REST_URL;
    const redisUrl = normalizeBaseUrl(rawRedisUrl, '');
    results.push({
      service: 'Redis (Upstash)',
      status: 'fail',
      message: 'Failed to connect to Redis',
      details:
        error instanceof Error && error.message === 'fetch failed'
          ? await redisFetchFailureDetails(redisUrl)
          : `category=UNKNOWN | error=${error instanceof Error ? error.message : String(error)}`,
      action: 'Check UPSTASH_REDIS_REST_URL formatting and URL/token pairing.',
    });
  }
}

async function validateResend() {
  console.log('[Resend] Checking runtime send config...');
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    results.push({
      service: 'Resend Send Config',
      status: 'warn',
      message: 'Resend runtime send config is incomplete',
      details: [
        env.RESEND_API_KEY ? undefined : 'missing RESEND_API_KEY',
        env.EMAIL_FROM ? undefined : 'missing EMAIL_FROM',
      ]
        .filter(Boolean)
        .join(' | '),
      action:
        'Set RESEND_API_KEY with Sending access and EMAIL_FROM to a verified sender. This check does not send email.',
    });
    return;
  }

  results.push({
    service: 'Resend Send Config',
    status: 'pass',
    message: 'Resend runtime send config is present',
  });
}

async function validateResendAdminDomain() {
  console.log('[Resend] Testing admin/domain readiness...');
  const adminApiKey = env.RESEND_ADMIN_API_KEY ?? env.RESEND_ADMIN_KEY;

  if (!adminApiKey) {
    results.push({
      service: 'Resend Admin Domain',
      status: 'warn',
      message: 'Resend admin/domain readiness is missing optional admin scope',
      action:
        'Keep RESEND_API_KEY for sending only. Add RESEND_ADMIN_API_KEY with Full access to enable the read-only domain readiness probe.',
    });
    return;
  }

  try {
    // Read-only admin probe. This does not send email and never uses RESEND_API_KEY.
    const response = await fetch('https://api.resend.com/domains', {
      headers: {
        Authorization: `Bearer ${adminApiKey}`,
      },
    });

    if (response.ok) {
      results.push({
        service: 'Resend Admin Domain',
        status: 'pass',
        message: 'Resend admin API key is valid for domain readiness',
      });
    } else {
      results.push({
        service: 'Resend Admin Domain',
        status: 'warn',
        message: 'Resend admin/domain readiness lacks the required admin scope',
        details: `HTTP ${response.status}`,
        action:
          'Optional readiness warning: keep RESEND_API_KEY for sending only and use RESEND_ADMIN_API_KEY with Full access for read-only domain readiness.',
      });
    }
  } catch (error) {
    results.push({
      service: 'Resend Admin Domain',
      status: 'warn',
      message: 'Resend admin/domain readiness probe could not complete',
      details: error instanceof Error ? error.message : String(error),
      action:
        'Optional readiness warning: verify RESEND_ADMIN_API_KEY admin scope and network reachability. This probe does not send email.',
    });
  }
}

function validateDeployedRuntimeServices(
  runtimeProof: RuntimeConfigProof,
  healthProof: RuntimeHealthProof,
) {
  const evaluation = evaluateDeployedRuntimeProof(runtimeProof, healthProof);

  results.push({
    service: 'Database',
    status: healthProof.databaseHealthy ? 'pass' : 'fail',
    message: healthProof.databaseHealthy
      ? 'Protected Preview database health passed'
      : 'Protected Preview database health failed',
  });
  results.push({
    service: 'Clerk',
    status:
      runtimeProof.clerkServerConfigured && runtimeProof.clerkPublishableConfigured
        ? 'pass'
        : 'fail',
    message:
      runtimeProof.clerkServerConfigured && runtimeProof.clerkPublishableConfigured
        ? 'Protected Preview Clerk configuration is present'
        : 'Protected Preview Clerk configuration is incomplete',
  });
  results.push({
    service: 'Stripe',
    status:
      runtimeProof.stripeMode === 'test' && runtimeProof.stripeWebhookConfigured ? 'pass' : 'fail',
    message:
      runtimeProof.stripeMode === 'test' && runtimeProof.stripeWebhookConfigured
        ? 'Protected Preview Stripe TEST configuration is present'
        : 'Protected Preview Stripe configuration is unsafe or incomplete',
  });
  results.push({
    service: 'Fulfillment',
    status:
      runtimeProof.fulfillmentDryRunEnabled && runtimeProof.fulfillmentProvider !== 'unknown'
        ? 'pass'
        : 'fail',
    message:
      runtimeProof.fulfillmentDryRunEnabled && runtimeProof.fulfillmentProvider !== 'unknown'
        ? 'Protected Preview fulfillment is dry-run safe'
        : 'Protected Preview fulfillment safety proof failed',
  });
  results.push({
    service: 'Redis (Upstash)',
    status: runtimeProof.upstashConfigured ? 'pass' : 'fail',
    message: runtimeProof.upstashConfigured
      ? 'Protected Preview Upstash configuration is present'
      : 'Protected Preview Upstash configuration is missing',
  });
  results.push({
    service: 'Printify',
    status: 'skip',
    message: 'Provider API probe skipped in deployed-runtime readiness mode',
    action:
      'Use provider-specific readiness with safe credentials when provider access is in scope.',
  });
  results.push({
    service: 'Resend',
    status: 'warn',
    message: 'Email readiness is outside deployed-runtime commerce proof',
    action: 'Use email-specific readiness when sending configuration is in scope.',
  });
  results.push({
    service: 'Deployment Protection',
    status:
      process.env.DEPLOYED_RUNTIME_ACCESS_METHOD === 'vercel-authenticated-connector'
        ? 'pass'
        : 'warn',
    message:
      process.env.DEPLOYED_RUNTIME_ACCESS_METHOD === 'vercel-authenticated-connector'
        ? 'Authenticated Vercel access proved the protected Preview deployment'
        : 'Deployment protection access method was not confirmed',
  });

  if (!evaluation.ok) {
    results.push({
      service: 'Deployed Runtime Proof',
      status: 'fail',
      message: 'Protected Preview runtime proof is not release-safe',
      details: evaluation.reasons.join(','),
    });
  }
}

async function main() {
  console.log('[Services] Validating connections...\n');

  if (readinessMode === 'deployed-runtime') {
    const runtimeProof = parseRuntimeConfigProof(process.env.DEPLOYED_RUNTIME_PROOF_JSON);
    const healthProof = parseRuntimeHealthProof(process.env.DEPLOYED_HEALTH_PROOF_JSON);

    if (!runtimeProof || !healthProof) {
      results.push({
        service: 'Deployed Runtime Proof',
        status: 'fail',
        message: 'Protected deployed runtime or health proof is missing or invalid',
      });
    } else if (
      runtimeProof.environment !== 'preview' ||
      (process.env.APP_ENV_TARGET ?? '').trim().toLowerCase() !== 'preview'
    ) {
      results.push({
        service: 'Deployed Runtime Proof',
        status: 'fail',
        message: 'Deployed-runtime service validation is allowed only for Preview',
      });
    } else {
      validateDeployedRuntimeServices(runtimeProof, healthProof);
    }
  } else {
    await validateDatabase();
    await validateClerk();
    await validateStripe();
    validateFulfillmentConfig();
    await validatePrintify();
    await validateRedis();
    await validateResend();
    await validateResendAdminDomain();
  }

  console.log('\n' + '='.repeat(80));
  console.log('[Results] Validation Results');
  console.log('='.repeat(80) + '\n');

  const passed = results.filter((r) => r.status === 'pass');
  const failed = results.filter((r) => r.status === 'fail');
  const warned = results.filter((r) => r.status === 'warn');
  const skipped = results.filter((r) => r.status === 'skip');

  results.forEach((result) => {
    console.log(`${result.message}`);
    if (result.details) {
      console.log(`   ${result.details}`);
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log(
    `Passed: ${passed.length} | Failed: ${failed.length} | Warnings: ${warned.length} | Skipped: ${skipped.length}`,
  );
  console.log('='.repeat(80) + '\n');

  if (warned.length > 0) {
    console.log('[Warning] Optional Readiness Issues Found:');
    warned.forEach((result) => {
      console.log(`\nWarning ${result.service}:`);
      console.log(`   Problem: ${result.message}`);
      if (result.details) {
        console.log(`   Details: ${result.details}`);
      }
      console.log(`   Action: ${result.action ?? 'Check your environment configuration'}`);
    });
  }

  if (failed.length > 0) {
    console.log('[Warning] Issues Found:');
    failed.forEach((result) => {
      console.log(`\nFailed ${result.service}:`);
      console.log(`   Problem: ${result.message}`);
      if (result.details) {
        console.log(`   Details: ${result.details}`);
      }
      console.log(`   Action: ${result.action ?? 'Check your environment configuration'}`);
    });
    process.exit(1);
  } else if (strict && warned.length > 0) {
    console.log('\nStrict mode failed because optional readiness warnings are present.');
    process.exit(1);
  } else {
    console.log('All required configured services are working correctly!');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('Validation script crashed:', error);
  process.exit(1);
});
