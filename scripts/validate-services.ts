#!/usr/bin/env tsx
/**
 * Service Validation Script
 * Tests that your API keys actually work
 */

import { env } from '@/env';

interface ValidationResult {
  service: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  details?: string;
}

const results: ValidationResult[] = [];

async function validateClerk() {
  console.log('[Auth] Testing Clerk Authentication...');
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
      results.push({
        service: 'Stripe',
        status: 'pass',
        message: 'Stripe API key is valid',
        details: [
          `Mode: ${env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'LIVE' : 'TEST'}`,
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

async function validatePrintify() {
  console.log('[Printify] Testing Printify...');
  if (!env.PRINTIFY_API_KEY) {
    results.push({
      service: 'Printify',
      status: 'skip',
      message: 'Printify API key not configured',
    });
    return;
  }

  try {
    const response = await fetch(`https://api.printify.com/v1/shops/${env.PRINTIFY_SHOP_ID}.json`, {
      headers: {
        Authorization: `Bearer ${env.PRINTIFY_API_KEY}`,
      },
    });

    if (response.ok) {
      const shop = (await response.json()) as { title?: string; id?: string };
      results.push({
        service: 'Printify',
        status: 'pass',
        message: 'Printify API key is valid',
        details: `Shop: ${shop.title || shop.id || 'Unknown'}`,
      });
    } else {
      results.push({
        service: 'Printify',
        status: 'fail',
        message: 'Printify API key is invalid',
        details: `HTTP ${response.status}`,
      });
    }
  } catch (error) {
    results.push({
      service: 'Printify',
      status: 'fail',
      message: 'Failed to connect to Printify',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

async function validateDatabase() {
  console.log('[Database] Testing Database Connection...');
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
    const response = await fetch(`${env.UPSTASH_REDIS_REST_URL}/ping`, {
      headers: {
        Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    });

    if (response.ok) {
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
        details: `HTTP ${response.status}`,
      });
    }
  } catch (error) {
    results.push({
      service: 'Redis (Upstash)',
      status: 'fail',
      message: 'Failed to connect to Redis',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

async function validateResend() {
  console.log('[Resend] Testing Resend Email...');
  if (!env.RESEND_API_KEY) {
    results.push({
      service: 'Resend Email',
      status: 'skip',
      message: 'Resend not configured',
    });
    return;
  }

  try {
    // Just check if the API key format is valid by fetching domains
    const response = await fetch('https://api.resend.com/domains', {
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
    });

    if (response.ok) {
      results.push({
        service: 'Resend Email',
        status: 'pass',
        message: 'Resend API key is valid',
      });
    } else {
      results.push({
        service: 'Resend Email',
        status: 'fail',
        message: 'Resend API key is invalid',
        details: `HTTP ${response.status}`,
      });
    }
  } catch (error) {
    results.push({
      service: 'Resend Email',
      status: 'fail',
      message: 'Failed to connect to Resend',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

async function main() {
  console.log('[Services] Validating connections...\n');

  await validateDatabase();
  await validateClerk();
  await validateStripe();
  await validatePrintify();
  await validateRedis();
  await validateResend();

  console.log('\n' + '='.repeat(80));
  console.log('[Results] Validation Results');
  console.log('='.repeat(80) + '\n');

  const passed = results.filter((r) => r.status === 'pass');
  const failed = results.filter((r) => r.status === 'fail');
  const skipped = results.filter((r) => r.status === 'skip');

  results.forEach((result) => {
    console.log(`${result.message}`);
    if (result.details) {
      console.log(`   ${result.details}`);
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log(`Passed: ${passed.length} | Failed: ${failed.length} | Skipped: ${skipped.length}`);
  console.log('='.repeat(80) + '\n');

  if (failed.length > 0) {
    console.log('[Warning] Issues Found:');
    failed.forEach((result) => {
      console.log(`\nFailed ${result.service}:`);
      console.log(`   Problem: ${result.message}`);
      if (result.details) {
        console.log(`   Details: ${result.details}`);
      }
      console.log('   Action: Check your .env.local and update the key');
    });
    process.exit(1);
  } else {
    console.log('All configured services are working correctly!');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('Validation script crashed:', error);
  process.exit(1);
});
