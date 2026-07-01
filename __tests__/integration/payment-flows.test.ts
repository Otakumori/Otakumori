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

function request(
  payment: 'petals' | 'stripe',
  packSlug = 'test_pack',
  idempotencyKey = 'test_key_123',
) {
  return new NextRequest('https://example.com/api/adults/purchase', {
    method: 'POST',
    headers: { 'x-idempotency-key': idempotencyKey },
    body: JSON.stringify({ packSlug, payment }),
  });
}

describe('End-to-End Payment Flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('handles a successful petal purchase from start to finish', async () => {
    const response = await POST(request('petals', 'premium_cosmetics_pack'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.method).toBe('petals');
    expect(mocks.getUserPetalInfo).toHaveBeenCalledWith('user_123');
    expect(mocks.spendPetals).toHaveBeenCalledWith(
      'user_123',
      1000,
      'Cosmetic pack purchase: premium_cosmetics_pack',
    );
  });

  it('handles insufficient petal balance gracefully', async () => {
    mocks.getUserPetalInfo.mockResolvedValue({
      success: true,
      data: { balance: 50 },
    });

    const response = await POST(request('petals', 'expensive_cosmetics_pack'));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('INSUFFICIENT_PETALS');
    expect(mocks.spendPetals).not.toHaveBeenCalled();
  });

  it('fails closed when the petal service is unavailable', async () => {
    mocks.getUserPetalInfo.mockRejectedValue(new Error('Database connection failed'));

    const response = await POST(request('petals'));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('INSUFFICIENT_PETALS');
  });

  it('creates a Stripe checkout session', async () => {
    const response = await POST(request('stripe', 'premium_cosmetics_pack'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.checkoutUrl).toBe('https://checkout.stripe.com/pay/cs_test_123');
    expect(mocks.createCheckoutSession).toHaveBeenCalledWith(expect.objectContaining({
      line_items: [
        expect.objectContaining({
          price_data: expect.objectContaining({
            unit_amount: 999,
            product_data: expect.objectContaining({
              name: 'Cosmetic Pack: premium_cosmetics_pack',
            }),
          }),
        }),
      ],
    }));
  });

  it('handles Stripe API failures gracefully', async () => {
    mocks.createCheckoutSession.mockRejectedValue(new Error('Stripe unavailable'));

    const response = await POST(request('stripe'));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe('INTERNAL_ERROR');
  });

  it('returns cached responses for concurrent identical requests', async () => {
    const cached = { ok: true, data: { purchaseId: 'cached' }, requestId: 'cached_request' };
    mocks.redisGet.mockResolvedValue(JSON.stringify(cached));

    const responses = await Promise.all([
      POST(request('petals', 'test_pack', 'same_key')),
      POST(request('petals', 'test_pack', 'same_key')),
    ]);

    expect(await responses[0].json()).toEqual(cached);
    expect(await responses[1].json()).toEqual(cached);
  });

  it('prevents duplicate purchases with an existing idempotency response', async () => {
    const cached = { ok: true, data: { purchaseId: 'cached' }, requestId: 'cached_request' };
    mocks.redisGet.mockResolvedValue(JSON.stringify(cached));

    await POST(request('petals'));

    expect(mocks.getUserPetalInfo).not.toHaveBeenCalled();
    expect(mocks.spendPetals).not.toHaveBeenCalled();
  });

  it('continues core payment processing when Redis reads fail', async () => {
    mocks.redisGet.mockRejectedValue(new Error('Redis unavailable'));

    const response = await POST(request('petals'));

    expect(response.status).toBe(200);
    expect(mocks.spendPetals).toHaveBeenCalledOnce();
  });

  it('handles malformed request data gracefully', async () => {
    const malformed = new NextRequest('https://example.com/api/adults/purchase', {
      method: 'POST',
      body: 'invalid json{',
    });

    const response = await POST(malformed);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe('INTERNAL_ERROR');
  });

  it('handles missing authentication gracefully', async () => {
    mocks.auth.mockResolvedValue({ userId: null });

    const response = await POST(request('petals'));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('AUTH_REQUIRED');
  });

  it('handles multiple concurrent purchases efficiently', async () => {
    const requests = Array.from({ length: 10 }, (_, index) =>
      request('petals', `test_pack_${index}`, `load_test_${index}`),
    );

    const responses = await Promise.all(requests.map((item) => POST(item)));

    expect(responses.every((response) => response.status === 200)).toBe(true);
    expect(mocks.spendPetals).toHaveBeenCalledTimes(10);
  });
});
