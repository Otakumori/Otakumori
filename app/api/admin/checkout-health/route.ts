export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { env } from '@/env';

type HealthStatus = 'pass' | 'warn' | 'fail';

type HealthCheck = {
  name: string;
  status: HealthStatus;
  message: string;
  detail?: Record<string, unknown>;
};

function hasValue(value: string | undefined) {
  return typeof value === 'string' && value.trim().length > 0;
}

function mask(value: string | undefined) {
  if (!value) return null;
  return value.length <= 8 ? 'configured' : `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function checkEnv(name: string, optional = false): HealthCheck {
  const envValues: Record<string, string | undefined> = {
    STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    STRIPE_WEBHOOK_SECRET: env.STRIPE_WEBHOOK_SECRET,
    DATABASE_URL: env.DATABASE_URL,
    CLERK_SECRET_KEY: env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SITE_URL: env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
    PRINTIFY_API_KEY: env.PRINTIFY_API_KEY,
    PRINTIFY_SHOP_ID: env.PRINTIFY_SHOP_ID,
    INNGEST_EVENT_KEY: env.INNGEST_EVENT_KEY,
    INNGEST_SIGNING_KEY: env.INNGEST_SIGNING_KEY,
    RESEND_API_KEY: env.RESEND_API_KEY,
    EMAIL_FROM: env.EMAIL_FROM,
  };
  const value = envValues[name];

  if (!hasValue(value)) {
    return {
      name,
      status: optional ? 'warn' : 'fail',
      message: optional
        ? `${name} is not configured. Related features may be incomplete.`
        : `${name} is missing. Checkout is not ready until this is configured.`,
    };
  }

  return {
    name,
    status: 'pass',
    message: `${name} is configured.`,
    detail: { masked: mask(value) },
  };
}

function requireInternalAccess(request: Request) {
  if (env.NODE_ENV !== 'production') return null;

  const expected = env.INTERNAL_AUTH_TOKEN;
  if (!hasValue(expected)) {
    return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  }

  const authHeader = request.headers.get('authorization') ?? '';
  const headerToken = request.headers.get('x-internal-auth') ?? '';
  const supplied = authHeader.replace(/^Bearer\s+/i, '').trim() || headerToken.trim();

  if (supplied !== expected) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}

async function checkDatabase(): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = [];

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.push({
      name: 'database.connection',
      status: 'pass',
      message: 'Database connection responded successfully.',
    });
  } catch (error) {
    checks.push({
      name: 'database.connection',
      status: 'fail',
      message: 'Database connection failed. Checkout cannot create orders until this is fixed.',
      detail: { error: error instanceof Error ? error.message : String(error) },
    });
    return checks;
  }

  try {
    const [productCount, enabledVariantCount] = await Promise.all([
      prisma.product.count(),
      prisma.productVariant.count({ where: { isEnabled: true, inStock: true } }),
    ]);

    checks.push({
      name: 'catalog.sellableVariants',
      status: enabledVariantCount > 0 ? 'pass' : 'warn',
      message:
        enabledVariantCount > 0
          ? 'At least one enabled, in-stock product variant exists for checkout testing.'
          : 'No enabled, in-stock product variants were found. Add a testable product variant before checkout QA.',
      detail: { productCount, enabledVariantCount },
    });
  } catch (error) {
    checks.push({
      name: 'catalog.sellableVariants',
      status: 'fail',
      message: 'Catalog readiness check failed.',
      detail: { error: error instanceof Error ? error.message : String(error) },
    });
  }

  try {
    const pendingOrderCount = await prisma.order.count({ where: { status: 'pending' } });
    checks.push({
      name: 'orders.table',
      status: 'pass',
      message: 'Order table is reachable for checkout session creation.',
      detail: { pendingOrderCount },
    });
  } catch (error) {
    checks.push({
      name: 'orders.table',
      status: 'fail',
      message: 'Order table is not reachable.',
      detail: { error: error instanceof Error ? error.message : String(error) },
    });
  }

  return checks;
}

export async function GET(request: Request) {
  const authFailure = requireInternalAccess(request);
  if (authFailure) return authFailure;

  const checks: HealthCheck[] = [
    checkEnv('STRIPE_SECRET_KEY'),
    checkEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
    checkEnv('STRIPE_WEBHOOK_SECRET'),
    checkEnv('DATABASE_URL'),
    checkEnv('CLERK_SECRET_KEY'),
    checkEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'),
    checkEnv('NEXT_PUBLIC_SITE_URL', true),
    checkEnv('NEXT_PUBLIC_APP_URL', true),
    checkEnv('PRINTIFY_API_KEY', true),
    checkEnv('PRINTIFY_SHOP_ID', true),
    checkEnv('INNGEST_EVENT_KEY', true),
    checkEnv('INNGEST_SIGNING_KEY', true),
    checkEnv('RESEND_API_KEY', true),
    checkEnv('EMAIL_FROM', true),
  ];

  checks.push(...(await checkDatabase()));

  const summary = checks.reduce(
    (acc, check) => {
      acc[check.status] += 1;
      return acc;
    },
    { pass: 0, warn: 0, fail: 0 } as Record<HealthStatus, number>,
  );

  const ready = summary.fail === 0;

  return NextResponse.json(
    {
      ok: ready,
      ready,
      checkedAt: new Date().toISOString(),
      summary,
      checks,
      nextActions:
        summary.fail > 0
          ? ['Fix failing checks before treating checkout as usable.']
          : summary.warn > 0
            ? ['Core checkout skeleton is reachable, but warnings should be resolved before launch.']
            : ['Checkout skeleton health checks are passing. Run Stripe webhook tests next.'],
    },
    { status: ready ? 200 : 503 },
  );
}
