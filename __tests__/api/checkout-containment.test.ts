import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const mocks = vi.hoisted(() => ({
  stripeConstructor: vi.fn(),
  withRateLimit: vi.fn(),
  requireLocalViewer: vi.fn(),
  checkIdempotency: vi.fn(),
  storeIdempotencyResponse: vi.fn(),
  orderCreate: vi.fn(),
  idempotencyCreate: vi.fn(),
}));

vi.mock('stripe', () => ({
  default: function StripeMock() {
    mocks.stripeConstructor();
    return { checkout: { sessions: { create: vi.fn() } } };
  },
}));

vi.mock('@/env', () => ({
  env: {
    STRIPE_SECRET_KEY: 'sk_test_unused',
    PRINTIFY_API_KEY: 'printify_test_unused',
    PRINTIFY_SHOP_ID: 'shop_test_unused',
  },
}));

vi.mock('@/app/lib/rateLimit', () => ({
  rateLimitConfigs: { api: {} },
  withRateLimit: mocks.withRateLimit,
}));

vi.mock('@/app/lib/auth/viewer', () => ({
  AuthenticationRequiredError: class AuthenticationRequiredError extends Error {},
  LocalUserUnavailableError: class LocalUserUnavailableError extends Error {},
  isMissingSchemaError: vi.fn(() => false),
  requireLocalViewer: mocks.requireLocalViewer,
}));

vi.mock('@/app/lib/idempotency', () => ({
  checkIdempotency: mocks.checkIdempotency,
  storeIdempotencyResponse: mocks.storeIdempotencyResponse,
}));

vi.mock('@/app/lib/prisma', () => ({
  prisma: {
    order: { create: mocks.orderCreate },
    idempotencyKey: { create: mocks.idempotencyCreate },
  },
}));

describe('checkout admission containment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('defaults to disabled even when provider configuration is present without source authorization', async () => {
    const { getCheckoutAdmissionPolicy } = await import('@/lib/checkout/admission');

    expect(getCheckoutAdmissionPolicy().enabled).toBe(false);
  });

  it('requires source authorization and both configuration attestations', async () => {
    const { evaluateCheckoutAdmission } = await import('@/lib/checkout/admission');

    expect(
      evaluateCheckoutAdmission({
        releaseAuthorized: true,
        checkoutConfigured: true,
        fulfillmentVerified: true,
      }),
    ).toBe(true);
    expect(
      evaluateCheckoutAdmission({
        releaseAuthorized: false,
        checkoutConfigured: true,
        fulfillmentVerified: true,
      }),
    ).toBe(false);
    expect(
      evaluateCheckoutAdmission({
        releaseAuthorized: true,
        checkoutConfigured: true,
        fulfillmentVerified: false,
      }),
    ).toBe(false);
  });

  it.each([
    '/api/v1/checkout/session',
    '/api/checkout/session',
    '/api/checkout',
  ])('returns the stable 503 contract through %s with no side effects', async (url) => {
    const canonical = await import('@/app/api/v1/checkout/session/route');
    const response = await canonical.POST(
      new NextRequest(`http://localhost${url}`, { method: 'POST' }),
    );

    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      code: 'CHECKOUT_TEMPORARILY_DISABLED',
      error: expect.stringMatching(/temporarily unavailable/i),
    });
    expect(mocks.withRateLimit).not.toHaveBeenCalled();
    expect(mocks.stripeConstructor).not.toHaveBeenCalled();
    expect(mocks.requireLocalViewer).not.toHaveBeenCalled();
    expect(mocks.checkIdempotency).not.toHaveBeenCalled();
    expect(mocks.storeIdempotencyResponse).not.toHaveBeenCalled();
    expect(mocks.orderCreate).not.toHaveBeenCalled();
    expect(mocks.idempotencyCreate).not.toHaveBeenCalled();
  });

  it('keeps both compatibility aliases bound to the canonical guard', async () => {
    const canonical = await import('@/app/api/v1/checkout/session/route');
    const sessionAlias = await import('@/app/api/checkout/session/route');
    const checkoutAlias = await import('@/app/api/checkout/route');

    expect(sessionAlias.POST).toBe(canonical.POST);
    expect(checkoutAlias.POST).toBe(canonical.POST);
  });
});
