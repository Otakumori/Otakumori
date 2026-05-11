import { describe, expect, it, vi } from 'vitest';
import {
  authorizeCheckoutHealthRequest,
  buildCheckoutHealthReport,
  type CheckoutHealthEnv,
  type CheckoutHealthPrisma,
} from '@/lib/checkout/health';

const completeEnv: CheckoutHealthEnv = {
  NODE_ENV: 'production',
  INTERNAL_AUTH_TOKEN: 'internal-token',
  STRIPE_SECRET_KEY: 'sk_test_123456789',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123456789',
  STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
  DATABASE_URL: 'postgresql://user:pass@example.com/db',
  CLERK_SECRET_KEY: 'clerk_secret_123456789',
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'clerk_public_123456789',
  NEXT_PUBLIC_SITE_URL: 'https://otakumori.test',
  NEXT_PUBLIC_APP_URL: 'https://otakumori.test',
  PRINTIFY_API_KEY: 'printify_123456789',
  PRINTIFY_SHOP_ID: 'shop_123',
  INNGEST_EVENT_KEY: 'inngest_event',
  INNGEST_SIGNING_KEY: 'inngest_signing',
  RESEND_API_KEY: 'resend_123',
  EMAIL_FROM: 'ops@otakumori.test',
};

function prismaMock(overrides: Partial<CheckoutHealthPrisma> = {}): CheckoutHealthPrisma {
  return {
    $queryRaw: vi.fn(async () => [{ ok: 1 }]),
    product: { count: vi.fn(async () => 2) },
    productVariant: { count: vi.fn(async () => 1) },
    order: { count: vi.fn(async () => 0) },
    ...overrides,
  };
}

describe('checkout health diagnostics', () => {
  it('missing env returns 503-ready report with operator guidance', async () => {
    const report = await buildCheckoutHealthReport(
      { ...completeEnv, STRIPE_SECRET_KEY: '' },
      prismaMock(),
      new Date('2026-05-06T12:00:00.000Z'),
    );

    expect(report.ready).toBe(false);
    expect(report.summary.fail).toBe(1);
    expect(report.checkedAt).toBe('2026-05-06T12:00:00.000Z');
    expect(report.checks).toContainEqual(expect.objectContaining({
      name: 'STRIPE_SECRET_KEY',
      status: 'fail',
      message: 'STRIPE_SECRET_KEY is missing. Checkout is not ready until this is configured.',
    }));
    expect(report.nextActions).toEqual(['Fix failing checks before treating checkout as usable.']);
  });

  it('DB down fails fast with the database error and does not claim catalog readiness', async () => {
    const report = await buildCheckoutHealthReport(
      completeEnv,
      prismaMock({ $queryRaw: vi.fn(async () => { throw new Error('connection refused'); }) }),
    );

    expect(report.ready).toBe(false);
    expect(report.checks).toContainEqual(expect.objectContaining({
      name: 'database.connection',
      status: 'fail',
      message: 'Database connection failed. Checkout cannot create orders until this is fixed.',
      detail: { error: 'connection refused' },
    }));
    expect(report.checks.some((check) => check.name === 'catalog.sellableVariants')).toBe(false);
  });

  it('no sellable variants warns with a concrete checkout QA next step', async () => {
    const report = await buildCheckoutHealthReport(
      completeEnv,
      prismaMock({ productVariant: { count: vi.fn(async () => 0) } }),
    );

    expect(report.ready).toBe(true);
    expect(report.summary.warn).toBe(1);
    expect(report.checks).toContainEqual(expect.objectContaining({
      name: 'catalog.sellableVariants',
      status: 'warn',
      message: 'No enabled, in-stock product variants were found. Add a testable product variant before checkout QA.',
      detail: { productCount: 2, enabledVariantCount: 0 },
    }));
    expect(report.nextActions).toEqual(['Core checkout skeleton is reachable, but warnings should be resolved before launch.']);
  });

  it('prod internal auth missing returns a hidden health endpoint response', () => {
    const request = new Request('https://otakumori.test/api/admin/checkout-health');

    expect(authorizeCheckoutHealthRequest(request, { ...completeEnv, INTERNAL_AUTH_TOKEN: '' })).toEqual({
      status: 404,
      body: { ok: false, error: 'Not found' },
    });
  });
});
