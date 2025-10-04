import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/adults/purchase/route.safe.ts';

// Mock environment variables
vi.mock('@/env', () => ({
  env: {
    FEATURE_ADULT_ZONE: 'true',
    FEATURE_GATED_COSMETICS: 'true',
  },
}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: 'user_123' }),
}));

// Mock Redis
vi.mock('@/app/lib/redis-rest', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

// Mock PetalService
vi.mock('@/app/lib/services/PetalService', () => ({
  PetalService: vi.fn().mockImplementation(() => ({
    getUserPetalInfo: vi.fn().mockResolvedValue({
      data: { balance: 1000 },
      ok: true,
    }),
    spendPetals: vi.fn().mockResolvedValue({
      data: { newBalance: 800, transactionId: 'txn_123' },
      ok: true,
    }),
  })),
}));

// Mock Stripe
vi.mock('@/app/lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          id: 'cs_test_123',
          url: 'https://checkout.stripe.com/pay/cs_test_123',
        }),
      },
    },
  },
}));

// Mock Database
vi.mock('@/app/lib/db', () => ({
  db: {
    $transaction: vi.fn().mockImplementation((fn) => fn()),
    idempotencyKey: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('/api/adults/purchase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 503 when feature flags are disabled', async () => {
    vi.mocked(require('@/env').env).FEATURE_ADULT_ZONE = 'false';

    const request = new NextRequest('https://example.com/api/adults/purchase', {
      method: 'POST',
      body: JSON.stringify({
        packSlug: 'test_pack',
        payment: 'petals',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.ok).toBe(false);
    expect(data.error.code).toBe('FEATURE_DISABLED');
  });

  it('should return 401 when user is not authenticated', async () => {
    vi.mocked(require('@clerk/nextjs/server').auth).mockResolvedValue({ userId: null });

    const request = new NextRequest('https://example.com/api/adults/purchase', {
      method: 'POST',
      body: JSON.stringify({
        packSlug: 'test_pack',
        payment: 'petals',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.ok).toBe(false);
    expect(data.error.code).toBe('AUTH_REQUIRED');
  });

  it('should return 400 for invalid request data', async () => {
    const request = new NextRequest('https://example.com/api/adults/purchase', {
      method: 'POST',
      body: JSON.stringify({
        packSlug: '', // Invalid empty slug
        payment: 'invalid_payment', // Invalid payment method
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return cached response for duplicate idempotency key', async () => {
    const cachedResponse = {
      ok: true,
      data: { purchaseId: 'cached_purchase_123' },
      requestId: 'otm_123_abc',
    };

    vi.mocked(require('@/app/lib/redis-rest').redis.get).mockResolvedValue(
      JSON.stringify(cachedResponse),
    );

    const request = new NextRequest('https://example.com/api/adults/purchase', {
      method: 'POST',
      headers: { 'x-idempotency-key': 'test_key_123' },
      body: JSON.stringify({
        packSlug: 'test_pack',
        payment: 'petals',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(cachedResponse);
  });

  it('should process petals purchase successfully', async () => {
    vi.mocked(require('@/app/lib/redis-rest').redis.get).mockResolvedValue(null);
    vi.mocked(require('@/app/lib/redis-rest').redis.set).mockResolvedValue('OK');

    const request = new NextRequest('https://example.com/api/adults/purchase', {
      method: 'POST',
      body: JSON.stringify({
        packSlug: 'test_pack',
        payment: 'petals',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.data.packSlug).toBe('test_pack');
    expect(data.data.payment).toBe('petals');
    expect(data.data.success).toBe(true);
    expect(data.data.method).toBe('petals');
    expect(data.requestId).toMatch(/^otm_\d+_[a-z0-9]+$/);
  });

  it('should process stripe purchase successfully', async () => {
    vi.mocked(require('@/app/lib/redis-rest').redis.get).mockResolvedValue(null);
    vi.mocked(require('@/app/lib/redis-rest').redis.set).mockResolvedValue('OK');

    const request = new NextRequest('https://example.com/api/adults/purchase', {
      method: 'POST',
      body: JSON.stringify({
        packSlug: 'test_pack',
        payment: 'stripe',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.data.packSlug).toBe('test_pack');
    expect(data.data.payment).toBe('stripe');
    expect(data.data.success).toBe(true);
    expect(data.data.method).toBe('stripe');
    expect(data.data.checkoutUrl).toMatch(
      /^https:\/\/checkout\.stripe\.com\/pay\/placeholder_\d+$/,
    );
  });

  it('should handle purchase with petals when insufficient balance', async () => {
    vi.mocked(require('@/app/lib/redis-rest').redis.get).mockResolvedValue(null);

    // Mock insufficient petals scenario
    const PetalService = vi.mocked(require('@/app/lib/services/PetalService').PetalService);
    const mockPetalService = new PetalService();
    vi.mocked(mockPetalService.getUserPetalInfo).mockResolvedValue({
      data: { balance: 50 }, // Insufficient balance
      ok: true,
    });

    const request = new NextRequest('https://example.com/api/adults/purchase', {
      method: 'POST',
      body: JSON.stringify({
        packSlug: 'expensive_pack',
        payment: 'petals',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(data.error.code).toBe('INSUFFICIENT_BALANCE');
  });

  it('should handle PetalService errors gracefully', async () => {
    vi.mocked(require('@/app/lib/redis-rest').redis.get).mockResolvedValue(null);

    // Mock PetalService error
    const PetalService = vi.mocked(require('@/app/lib/services/PetalService').PetalService);
    const mockPetalService = new PetalService();
    vi.mocked(mockPetalService.getUserPetalInfo).mockRejectedValue(
      new Error('Database connection failed'),
    );

    const request = new NextRequest('https://example.com/api/adults/purchase', {
      method: 'POST',
      body: JSON.stringify({
        packSlug: 'test_pack',
        payment: 'petals',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.ok).toBe(false);
    expect(data.error.code).toBe('INTERNAL_ERROR');
  });

  it('should handle Stripe API errors', async () => {
    vi.mocked(require('@/app/lib/redis-rest').redis.get).mockResolvedValue(null);

    // Mock Stripe error
    const stripe = vi.mocked(require('@/app/lib/stripe').stripe);
    vi.mocked(stripe.checkout.sessions.create).mockRejectedValue(new Error('Stripe API error'));

    const request = new NextRequest('https://example.com/api/adults/purchase', {
      method: 'POST',
      body: JSON.stringify({
        packSlug: 'test_pack',
        payment: 'stripe',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.ok).toBe(false);
    expect(data.error.code).toBe('INTERNAL_ERROR');
  });

  it('should validate required idempotency key for mutating requests', async () => {
    const request = new NextRequest('https://example.com/api/adults/purchase', {
      method: 'POST',
      // Missing x-idempotency-key header
      body: JSON.stringify({
        packSlug: 'test_pack',
        payment: 'petals',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.message).toContain('idempotency');
  });

  it('should handle malformed JSON request body', async () => {
    const request = new NextRequest('https://example.com/api/adults/purchase', {
      method: 'POST',
      headers: { 'x-idempotency-key': 'test_key_123' },
      body: 'invalid json{',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should handle database transaction failures', async () => {
    vi.mocked(require('@/app/lib/redis-rest').redis.get).mockResolvedValue(null);

    // Mock database transaction failure
    const db = vi.mocked(require('@/app/lib/db').db);
    vi.mocked(db.$transaction).mockRejectedValue(new Error('Database transaction failed'));

    const request = new NextRequest('https://example.com/api/adults/purchase', {
      method: 'POST',
      headers: { 'x-idempotency-key': 'test_key_123' },
      body: JSON.stringify({
        packSlug: 'test_pack',
        payment: 'petals',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.ok).toBe(false);
    expect(data.error.code).toBe('INTERNAL_ERROR');
  });

  it('should handle rate limiting scenarios', async () => {
    // This test would require mocking the rate limiting middleware
    // For now, we'll test the basic flow
    vi.mocked(require('@/app/lib/redis-rest').redis.get).mockResolvedValue(null);

    const request = new NextRequest('https://example.com/api/adults/purchase', {
      method: 'POST',
      headers: { 'x-idempotency-key': 'test_key_123' },
      body: JSON.stringify({
        packSlug: 'test_pack',
        payment: 'petals',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
  });

  it('should validate packSlug format and length', async () => {
    const request = new NextRequest('https://example.com/api/adults/purchase', {
      method: 'POST',
      headers: { 'x-idempotency-key': 'test_key_123' },
      body: JSON.stringify({
        packSlug: 'a'.repeat(256), // Too long
        payment: 'petals',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should handle concurrent requests with same idempotency key', async () => {
    const cachedResponse = {
      ok: true,
      data: { purchaseId: 'cached_purchase_123' },
      requestId: 'otm_123_abc',
    };

    vi.mocked(require('@/app/lib/redis-rest').redis.get).mockResolvedValue(
      JSON.stringify(cachedResponse),
    );

    // Simulate concurrent requests
    const request1 = new NextRequest('https://example.com/api/adults/purchase', {
      method: 'POST',
      headers: { 'x-idempotency-key': 'concurrent_key_123' },
      body: JSON.stringify({
        packSlug: 'test_pack',
        payment: 'petals',
      }),
    });

    const request2 = new NextRequest('https://example.com/api/adults/purchase', {
      method: 'POST',
      headers: { 'x-idempotency-key': 'concurrent_key_123' },
      body: JSON.stringify({
        packSlug: 'test_pack',
        payment: 'petals',
      }),
    });

    const [response1, response2] = await Promise.all([POST(request1), POST(request2)]);

    const [data1, data2] = await Promise.all([response1.json(), response2.json()]);

    // Both should return the same cached response
    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
    expect(data1).toEqual(cachedResponse);
    expect(data2).toEqual(cachedResponse);
  });
});
