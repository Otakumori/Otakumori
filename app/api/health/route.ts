import { NextResponse } from 'next/server';
import { env } from '@/env.mjs';
import { prisma } from '@/server/db';

export const runtime = 'nodejs';

type DependencyStatus = 'pass' | 'warn' | 'fail' | 'skipped';

type DependencyCheck = {
  status: DependencyStatus;
  message: string;
  nextAction?: string;
  latencyMs?: number;
};

const REQUIRED_CONFIG = [
  'DATABASE_URL',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
] as const;

function hasValue(value: string | undefined) {
  return typeof value === 'string' && value.trim().length > 0;
}

function configCheck(name: (typeof REQUIRED_CONFIG)[number]): DependencyCheck {
  return hasValue(env[name])
    ? {
        status: 'pass',
        message: `${name} is configured.`,
      }
    : {
        status: 'fail',
        message: `${name} is missing.`,
        nextAction: `Set ${name} in Vercel project environment variables.`,
      };
}

function optionalProviderCheck(
  name: string,
  configured: boolean,
  nextAction: string,
): DependencyCheck {
  return configured
    ? {
        status: 'pass',
        message: `${name} configuration is present.`,
      }
    : {
        status: 'skipped',
        message: `${name} is not configured for this environment.`,
        nextAction,
      };
}

function sanitizedDatabaseMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return 'Database health query failed.';
  }

  if ('code' in error && typeof error.code === 'string') {
    return `Database health query failed with Prisma code ${error.code}.`;
  }

  return 'Database health query failed.';
}

async function checkDatabase(): Promise<DependencyCheck> {
  const started = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'pass',
      message: 'Database responded to a lightweight health query.',
      latencyMs: Date.now() - started,
    };
  } catch (error) {
    return {
      status: 'fail',
      message: sanitizedDatabaseMessage(error),
      nextAction: 'Verify DATABASE_URL, Neon connectivity, Prisma schema deployment, and Vercel env scope.',
      latencyMs: Date.now() - started,
    };
  }
}

export async function GET(request: Request) {
  const checks: Record<string, DependencyCheck> = {};

  for (const name of REQUIRED_CONFIG) {
    checks[`config.${name}`] = configCheck(name);
  }

  checks.database = await checkDatabase();
  checks.printify = optionalProviderCheck(
    'Printify',
    hasValue(env.PRINTIFY_API_KEY) && hasValue(env.PRINTIFY_SHOP_ID),
    'Set PRINTIFY_API_KEY and PRINTIFY_SHOP_ID before live Printify fulfillment testing.',
  );
  checks.merchize = optionalProviderCheck(
    'Merchize',
    (hasValue(env.MERCHIZE_API_URL) || hasValue(env.MERCHIZE_STORE_API_URL)) &&
      (hasValue(env.MERCHIZE_ACCESS_TOKEN) || hasValue(env.MERCHIZE_API_TOKEN)),
    'Set a Merchize API URL and token before live Merchize fulfillment testing.',
  );
  checks.blob = optionalProviderCheck(
    'Vercel Blob',
    hasValue(env.BLOB_READ_WRITE_TOKEN),
    'Set BLOB_READ_WRITE_TOKEN only if media upload flows are enabled for this environment.',
  );

  const values = Object.values(checks);
  const failed = values.filter((check) => check.status === 'fail').length;
  const warnings = values.filter((check) => check.status === 'warn').length;
  const skipped = values.filter((check) => check.status === 'skipped').length;
  const status = failed > 0 ? 'unhealthy' : warnings > 0 || skipped > 0 ? 'degraded' : 'healthy';

  const strictStatus = new URL(request.url).searchParams.get('strict') === '1';

  return NextResponse.json(
    {
      ok: failed === 0,
      status,
      checkedAt: new Date().toISOString(),
      summary: {
        pass: values.filter((check) => check.status === 'pass').length,
        warn: warnings,
        fail: failed,
        skipped,
      },
      checks,
      nextActions:
        failed > 0
          ? ['Fix failing required checks before treating the deployment as production-ready.']
          : skipped > 0
            ? ['Optional provider checks were skipped because their env vars are not configured.']
            : ['Health checks are passing. Continue checkout and webhook manual verification.'],
    },
    {
      status: strictStatus && failed > 0 ? 503 : 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
