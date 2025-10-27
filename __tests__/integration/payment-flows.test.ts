import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock all dependencies for E2E testing
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

vi.mock('@/env', () => ({
  env: {
    FEATURE_ADULT_ZONE: 'true',
    FEATURE_GATED_COSMETICS: 'true',
  },
}));

vi.mock('@/app/lib/redis-rest', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock('@/app/lib/services/PetalService', () => ({
  PetalService: vi.fn().mockImplementation(() => ({
    getUserPetalInfo: vi.fn(),
    spendPetals: vi.fn(),
  })),
}));

vi.mock('@/app/lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
  },
}));

vi.mock('@/app/lib/db', () => ({
  db: {
    $transaction: vi.fn().mockImplementation((fn) => fn()),
    idempotencyKey: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('End-to-End Payment Flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete Petal Purchase Flow', () => {
    it('should handle successful petal purchase from start to finish', async () => {
      // Mock authenticated user
      vi.mocked(require('@clerk/nextjs/server').auth).mockResolvedValue({
        userId: 'user_123',
      });

      // Mock sufficient petal balance
      const PetalService = vi.mocked(require('@/app/lib/services/PetalService').PetalService);
      const mockPetalService = new PetalService();
      vi.mocked(mockPetalService.getUserPetalInfo).mockResolvedValue({
        data: { balance: 1000 },
        ok: true,
      });
      vi.mocked(mockPetalService.spendPetals).mockResolvedValue({
        data: { newBalance: 800, transactionId: 'txn_123' },
        ok: true,
      });

      // Mock no cached response
      vi.mocked(require('@/app/lib/redis-rest').redis.get).mockResolvedValue(null);
      vi.mocked(require('@/app/lib/redis-rest').redis.set).mockResolvedValue('OK');

      // Import and test the purchase endpoint
      const { POST } = await import('@/app/api/adults/purchase/route.safe.ts');

      const request = new NextRequest('https://example.com/api/adults/purchase', {
        method: 'POST',
        headers: { 'x-idempotency-key': 'test_key_123' },
        body: JSON.stringify({
          packSlug: 'premium_cosmetics_pack',
          payment: 'petals',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Verify successful purchase
      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.data.success).toBe(true);
      expect(data.data.method).toBe('petals');
      expect(data.data.packSlug).toBe('premium_cosmetics_pack');
      expect(data.requestId).toMatch(/^otm_\d+_[a-z0-9]+$/);

      // Verify PetalService was called correctly
      expect(mockPetalService.getUserPetalInfo).toHaveBeenCalledWith('user_123');
      expect(mockPetalService.spendPetals).toHaveBeenCalledWith(
        'user_123',
        200, // Expected pack price
        'Cosmetic pack purchase: premium_cosmetics_pack',
      );
    });

    it('should handle insufficient petal balance gracefully', async () => {
      // Mock authenticated user
      vi.mocked(require('@clerk/nextjs/server').auth).mockResolvedValue({
        userId: 'user_123',
      });

      // Mock insufficient petal balance
      const PetalService = vi.mocked(require('@/app/lib/services/PetalService').PetalService);
      const mockPetalService = new PetalService();
      vi.mocked(mockPetalService.getUserPetalInfo).mockResolvedValue({
        data: { balance: 50 }, // Insufficient for expensive pack
        ok: true,
      });

      // Mock no cached response
      vi.mocked(require('@/app/lib/redis-rest').redis.get).mockResolvedValue(null);

      const { POST } = await import('@/app/api/adults/purchase/route.safe.ts');

      const request = new NextRequest('https://example.com/api/adults/purchase', {
        method: 'POST',
        headers: { 'x-idempotency-key': 'test_key_123' },
        body: JSON.stringify({
          packSlug: 'expensive_cosmetics_pack',
          payment: 'petals',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Verify insufficient balance error
      expect(response.status).toBe(400);
      expect(data.ok).toBe(false);
      expect(data.error.code).toBe('INSUFFICIENT_BALANCE');

      // Verify spendPetals was not called
      expect(mockPetalService.spendPetals).not.toHaveBeenCalled();
    });

    it('should handle petal service failures gracefully', async () => {
      // Mock authenticated user
      vi.mocked(require('@clerk/nextjs/server').auth).mockResolvedValue({
        userId: 'user_123',
      });

      // Mock PetalService failure
      const PetalService = vi.mocked(require('@/app/lib/services/PetalService').PetalService);
      const mockPetalService = new PetalService();
      vi.mocked(mockPetalService.getUserPetalInfo).mockRejectedValue(
        new Error('Database connection failed'),
      );

      // Mock no cached response
      vi.mocked(require('@/app/lib/redis-rest').redis.get).mockResolvedValue(null);

      const { POST } = await import('@/app/api/adults/purchase/route.safe.ts');

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

      // Verify error handling
      expect(response.status).toBe(500);
      expect(data.ok).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('Complete Stripe Purchase Flow', () => {
    it('should handle successful Stripe checkout session creation', async () => {
      // Mock authenticated user
      vi.mocked(require('@clerk/nextjs/server').auth).mockResolvedValue({
        userId: 'user_123',
      });

      // Mock successful Stripe session creation
      const stripe = vi.mocked(require('@/app/lib/stripe').stripe);
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue({
        id: 'cs_test_123456',
        url: 'https://checkout.stripe.com/pay/cs_test_123456',
      });

      // Mock no cached response
      vi.mocked(require('@/app/lib/redis-rest').redis.get).mockResolvedValue(null);
      vi.mocked(require('@/app/lib/redis-rest').redis.set).mockResolvedValue('OK');

      const { POST } = await import('@/app/api/adults/purchase/route.safe.ts');

      const request = new NextRequest('https://example.com/api/adults/purchase', {
        method: 'POST',
        headers: { 'x-idempotency-key': 'test_key_123' },
        body: JSON.stringify({
          packSlug: 'premium_cosmetics_pack',
          payment: 'stripe',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Verify successful Stripe session creation
      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.data.success).toBe(true);
      expect(data.data.method).toBe('stripe');
      expect(data.data.checkoutUrl).toBe('https://checkout.stripe.com/pay/cs_test_123456');

      // Verify Stripe was called correctly
      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'payment',
          customer_email: expect.any(String),
          line_items: expect.arrayContaining([
            expect.objectContaining({
              price_data: expect.objectContaining({
                currency: 'usd',
                product_data: expect.objectContaining({
                  name: 'Premium Cosmetics Pack',
                }),
              }),
            }),
          ]),
          success_url: expect.stringContaining('success=true'),
          cancel_url: expect.stringContaining('canceled=true'),
        }),
      );
    });

    it('should handle Stripe API failures gracefully', async () => {
      // Mock authenticated user
      vi.mocked(require('@clerk/nextjs/server').auth).mockResolvedValue({
        userId: 'user_123',
      });

      // Mock Stripe API failure
      const stripe = vi.mocked(require('@/app/lib/stripe').stripe);
      vi.mocked(stripe.checkout.sessions.create).mockRejectedValue(
        new Error('Stripe API temporarily unavailable'),
      );

      // Mock no cached response
      vi.mocked(require('@/app/lib/redis-rest').redis.get).mockResolvedValue(null);

      const { POST } = await import('@/app/api/adults/purchase/route.safe.ts');

      const request = new NextRequest('https://example.com/api/adults/purchase', {
        method: 'POST',
        headers: { 'x-idempotency-key': 'test_key_123' },
        body: JSON.stringify({
          packSlug: 'test_pack',
          payment: 'stripe',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Verify error handling
      expect(response.status).toBe(500);
      expect(data.ok).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('Idempotency and Concurrency', () => {
    it('should handle concurrent identical requests with idempotency', async () => {
      // Mock authenticated user
      vi.mocked(require('@clerk/nextjs/server').auth).mockResolvedValue({
        userId: 'user_123',
      });

      // Mock cached response for first request
      const cachedResponse = {
        ok: true,
        data: {
          packSlug: 'test_pack',
          payment: 'petals',
          success: true,
          method: 'petals',
        },
        requestId: 'otm_123_abc',
      };

      vi.mocked(require('@/app/lib/redis-rest').redis.get).mockResolvedValue(
        JSON.stringify(cachedResponse),
      );

      const { POST } = await import('@/app/api/adults/purchase/route.safe.ts');

      // Create identical concurrent requests
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

      // Execute requests concurrently
      const [response1, response2] = await Promise.all([POST(request1), POST(request2)]);

      const [data1, data2] = await Promise.all([response1.json(), response2.json()]);

      // Both should return identical cached responses
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(data1).toEqual(cachedResponse);
      expect(data2).toEqual(cachedResponse);
      expect(data1.requestId).toBe(data2.requestId);
    });

    it('should prevent duplicate purchases with same idempotency key', async () => {
      // Mock authenticated user
      vi.mocked(require('@clerk/nextjs/server').auth).mockResolvedValue({
        userId: 'user_123',
      });

      // Mock cached response
      const cachedResponse = {
        ok: true,
        data: {
          packSlug: 'test_pack',
          payment: 'petals',
          success: true,
          method: 'petals',
        },
        requestId: 'otm_123_abc',
      };

      vi.mocked(require('@/app/lib/redis-rest').redis.get).mockResolvedValue(
        JSON.stringify(cachedResponse),
      );

      const { POST } = await import('@/app/api/adults/purchase/route.safe.ts');

      const request = new NextRequest('https://example.com/api/adults/purchase', {
        method: 'POST',
        headers: { 'x-idempotency-key': 'duplicate_key_123' },
        body: JSON.stringify({
          packSlug: 'test_pack',
          payment: 'petals',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Should return cached response, not process new purchase
      expect(response.status).toBe(200);
      expect(data).toEqual(cachedResponse);

      // Verify no new database operations occurred
      const db = vi.mocked(require('@/app/lib/db').db);
      expect(db.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should handle partial system failures gracefully', async () => {
      // Mock authenticated user
      vi.mocked(require('@clerk/nextjs/server').auth).mockResolvedValue({
        userId: 'user_123',
      });

      // Mock Redis failure (cache unavailable)
      vi.mocked(require('@/app/lib/redis-rest').redis.get).mockRejectedValue(
        new Error('Redis connection failed'),
      );

      // Mock successful PetalService (core functionality works)
      const PetalService = vi.mocked(require('@/app/lib/services/PetalService').PetalService);
      const mockPetalService = new PetalService();
      vi.mocked(mockPetalService.getUserPetalInfo).mockResolvedValue({
        data: { balance: 1000 },
        ok: true,
      });
      vi.mocked(mockPetalService.spendPetals).mockResolvedValue({
        data: { newBalance: 800, transactionId: 'txn_123' },
        ok: true,
      });

      const { POST } = await import('@/app/api/adults/purchase/route.safe.ts');

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

      // Should still process payment despite cache failure
      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.data.success).toBe(true);
    });

    it('should handle malformed request data gracefully', async () => {
      // Mock authenticated user
      vi.mocked(require('@clerk/nextjs/server').auth).mockResolvedValue({
        userId: 'user_123',
      });

      const { POST } = await import('@/app/api/adults/purchase/route.safe.ts');

      const request = new NextRequest('https://example.com/api/adults/purchase', {
        method: 'POST',
        headers: { 'x-idempotency-key': 'test_key_123' },
        body: 'invalid json{', // Malformed JSON
      });

      const response = await POST(request);
      const data = await response.json();

      // Should return validation error
      expect(response.status).toBe(400);
      expect(data.ok).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle missing authentication gracefully', async () => {
      // Mock unauthenticated user
      vi.mocked(require('@clerk/nextjs/server').auth).mockResolvedValue({
        userId: null,
      });

      const { POST } = await import('@/app/api/adults/purchase/route.safe.ts');

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

      // Should return authentication error
      expect(response.status).toBe(401);
      expect(data.ok).toBe(false);
      expect(data.error.code).toBe('AUTH_REQUIRED');
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle multiple concurrent purchases efficiently', async () => {
      // Mock authenticated users
      vi.mocked(require('@clerk/nextjs/server').auth).mockResolvedValue({
        userId: 'user_123',
      });

      // Mock successful services
      const PetalService = vi.mocked(require('@/app/lib/services/PetalService').PetalService);
      const mockPetalService = new PetalService();
      vi.mocked(mockPetalService.getUserPetalInfo).mockResolvedValue({
        data: { balance: 10000 },
        ok: true,
      });
      vi.mocked(mockPetalService.spendPetals).mockResolvedValue({
        data: { newBalance: 9800, transactionId: 'txn_123' },
        ok: true,
      });

      vi.mocked(require('@/app/lib/redis-rest').redis.get).mockResolvedValue(null);
      vi.mocked(require('@/app/lib/redis-rest').redis.set).mockResolvedValue('OK');

      const { POST } = await import('@/app/api/adults/purchase/route.safe.ts');

      // Create multiple concurrent requests with different idempotency keys
      const requests = Array.from({ length: 10 }, (_, i) => {
        return new NextRequest('https://example.com/api/adults/purchase', {
          method: 'POST',
          headers: { 'x-idempotency-key': `load_test_key_${i}` },
          body: JSON.stringify({
            packSlug: `test_pack_${i}`,
            payment: 'petals',
          }),
        });
      });

      // Execute all requests concurrently
      const startTime = Date.now();
      const responses = await Promise.all(requests.map((request) => POST(request)));
      const endTime = Date.now();

      // Verify all requests succeeded
      for (const response of responses) {
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.ok).toBe(true);
        expect(data.data.success).toBe(true);
      }

      // Verify reasonable performance (should complete within 5 seconds)
      expect(endTime - startTime).toBeLessThan(5000);
    });
  });
});
