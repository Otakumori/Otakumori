import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  env: {
    FEATURE_ADULT_ZONE: 'true',
    FEATURE_GATED_COSMETICS: 'true',
    NEXT_PUBLIC_APP_URL: 'https://example.com',
  },
  redisGet: vi.fn(),
  redisSet: vi.fn(),
  getUserPetalInfo: vi.fn(),
  spendPetals: vi.fn(),
  createCheckoutSession: vi.fn(),
}));

vi.mock('@clerk/nextjs/server', () => ({ auth: mocks.auth }));
vi.mock('@/env', () => ({ env: mocks.env }));
vi.mock('@/app/lib/redis-rest', () => ({
  redis: { get: mocks.redisGet, set: mocks.redisSet },
}));
vi.mock('@/app/lib/petals', () => ({
  PetalService: class {
    getUserPetalInfo = mocks.getUserPetalInfo;
    spendPetals = mocks.spendPetals;
  },
}));
vi.mock('@/app/lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: { create: mocks.createCheckoutSession },
    },
  },
}));

import { POST } from '@/app/api/adults/purchase/route.safe';

function purchaseRequest(
  body: unknown,
  idempotencyKey: string | null = 'test_key_123',
) {
  const headers = idempotencyKey ? { 'x-idempotency-key': idempotencyKey } : undefined;
  return new NextRequest('https://example.com/api/adults/purchase', {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('/api/adults/purchase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.env.FEATURE_ADULT_ZONE = 'true';
    mocks.env.FEATURE_GATED_COSMETICS = 'true';
    mocks.auth.mockResolvedValue({ userId: 'user_123' });
    mocks.redisGet.mockResolvedValue(null);
    mocks.redisSet.mockResolvedValue('OK');
    mocks.getUserPetalInfo.mockResolvedValue({
      success: true,
      data: { balance: 2000 },
    });
    mocks.spendPetals.mockResolvedValue({
      success: true,
      newBalance: 1000,
      lifetimePetalsEarned: 2000,
    });
    mocks.createCheckoutSession.mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/pay/cs_test_123',
    });
  });

  it('returns 503 when feature flags are disabled', async () => {
    mocks.env.FEATURE_ADULT_ZONE = 'false';

    const response = await POST(purchaseRequest({ packSlug: 'test_pack', payment: 'petals' }));
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error.code).toBe('FEATURE_DISABLED');
  });

  it('returns 401 when user is not authenticated', async () => {
    mocks.auth.mockResolvedValue({ userId: null });

    const response = await POST(purchaseRequest({ packSlug: 'test_pack', payment: 'petals' }));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('AUTH_REQUIRED');
  });

  it('returns 400 for invalid request data', async () => {
    const response = await POST(purchaseRequest({ packSlug: '', payment: 'invalid' }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns the cached response for a duplicate idempotency key', async () => {
    const cached = { ok: true, data: { purchaseId: 'cached' }, requestId: 'request_cached' };
    mocks.redisGet.mockResolvedValue(JSON.stringify(cached));

    const response = await POST(purchaseRequest({ packSlug: 'test_pack', payment: 'petals' }));

    expect(await response.json()).toEqual(cached);
    expect(mocks.getUserPetalInfo).not.toHaveBeenCalled();
  });

  it('processes a petals purchase successfully', async () => {
    const response = await POST(purchaseRequest({ packSlug: 'test_pack', payment: 'petals' }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual(expect.objectContaining({
      packSlug: 'test_pack',
      payment: 'petals',
      success: true,
      method: 'petals',
    }));
    expect(mocks.spendPetals).toHaveBeenCalledWith(
      'user_123',
      1000,
      'Cosmetic pack purchase: test_pack',
    );
  });

  it('processes a Stripe purchase successfully', async () => {
    const response = await POST(purchaseRequest({ packSlug: 'test_pack', payment: 'stripe' }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.checkoutUrl).toBe('https://checkout.stripe.com/pay/cs_test_123');
    expect(mocks.createCheckoutSession).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'payment',
      success_url: 'https://example.com/shop/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://example.com/shop/cancel',
    }));
  });

  it('returns insufficient petals when the balance is too low', async () => {
    mocks.getUserPetalInfo.mockResolvedValue({
      success: true,
      data: { balance: 50 },
    });

    const response = await POST(purchaseRequest({ packSlug: 'expensive', payment: 'petals' }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('INSUFFICIENT_PETALS');
    expect(mocks.spendPetals).not.toHaveBeenCalled();
  });

  it('fails closed when PetalService cannot verify the balance', async () => {
    mocks.getUserPetalInfo.mockRejectedValue(new Error('Database connection failed'));

    const response = await POST(purchaseRequest({ packSlug: 'test_pack', payment: 'petals' }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('INSUFFICIENT_PETALS');
  });

  it('handles Stripe API errors', async () => {
    mocks.createCheckoutSession.mockRejectedValue(new Error('Stripe API error'));

    const response = await POST(purchaseRequest({ packSlug: 'test_pack', payment: 'stripe' }));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe('INTERNAL_ERROR');
  });

  it('generates an idempotency key when the header is absent', async () => {
    const response = await POST(
      purchaseRequest({ packSlug: 'test_pack', payment: 'petals' }, null),
    );

    expect(response.status).toBe(200);
    expect(mocks.redisGet).toHaveBeenCalledWith(expect.stringMatching(
      /^purchase:purchase_user_123_test_pack_\d+$/,
    ));
  });

  it('handles malformed JSON request bodies', async () => {
    const response = await POST(purchaseRequest('invalid json{'));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe('INTERNAL_ERROR');
  });

  it('continues when idempotency storage is unavailable', async () => {
    mocks.redisSet.mockRejectedValue(new Error('Redis write failed'));

    const response = await POST(purchaseRequest({ packSlug: 'test_pack', payment: 'petals' }));

    expect(response.status).toBe(200);
  });

  it('continues when the idempotency lookup is unavailable', async () => {
    mocks.redisGet.mockRejectedValue(new Error('Redis read failed'));

    const response = await POST(purchaseRequest({ packSlug: 'test_pack', payment: 'petals' }));

    expect(response.status).toBe(200);
    expect(mocks.spendPetals).toHaveBeenCalledOnce();
  });

  it('accepts a nonempty pack slug supported by the current contract', async () => {
    const packSlug = 'a'.repeat(256);

    const response = await POST(purchaseRequest({ packSlug, payment: 'petals' }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.packSlug).toBe(packSlug);
  });

  it('returns the same cached response to concurrent duplicate requests', async () => {
    const cached = { ok: true, data: { purchaseId: 'cached' }, requestId: 'request_cached' };
    mocks.redisGet.mockResolvedValue(JSON.stringify(cached));
    const body = { packSlug: 'test_pack', payment: 'petals' };

    const responses = await Promise.all([
      POST(purchaseRequest(body, 'concurrent_key')),
      POST(purchaseRequest(body, 'concurrent_key')),
    ]);

    expect(await responses[0].json()).toEqual(cached);
    expect(await responses[1].json()).toEqual(cached);
    expect(mocks.spendPetals).not.toHaveBeenCalled();
  });
});
