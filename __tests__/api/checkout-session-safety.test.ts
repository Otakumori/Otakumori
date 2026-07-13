import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/prisma';
import { db } from '@/app/lib/db';

const stripeSessionCreate = vi.hoisted(() => vi.fn());

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: stripeSessionCreate,
      },
    },
  })),
}));

vi.mock('@/env', () => ({
  env: {
    STRIPE_SECRET_KEY: 'sk_test_mock',
  },
}));

vi.mock('@/app/lib/prisma', () => ({
  prisma: {
    product: {
      findUnique: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('@/app/lib/db', () => ({
  db: {
    product: {
      findUnique: vi.fn(),
    },
    order: {
      create: vi.fn(),
    },
    orderItem: {
      create: vi.fn(),
    },
  },
  DatabaseAccess: {
    getCurrentUser: vi.fn(),
  },
}));

vi.mock('@/app/lib/rateLimit', () => ({
  rateLimitConfigs: { api: {}, auth: {} },
  withRateLimit: vi.fn((_req, _config, handler) => handler()),
}));

vi.mock('@/app/lib/idempotency', () => ({
  checkIdempotency: vi.fn().mockResolvedValue({ isNew: true }),
  storeIdempotencyResponse: vi.fn(),
}));

vi.mock('@/lib/coupons/engine', () => ({
  getApplicableCoupons: vi.fn().mockResolvedValue({
    normalizedCodes: [],
    discountTotal: 0,
    shippingDiscount: 0,
  }),
  normalizeCode: vi.fn((code: string) => code.toUpperCase()),
}));

vi.mock('@/app/config/petalTuning', () => ({
  getDiscountConfig: vi.fn().mockResolvedValue({ maxPercent: 100, minOrderCents: 0 }),
}));

vi.mock('@/app/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

function request(url: string) {
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'x-idempotency-key': 'idempotency-key-1' },
    body: JSON.stringify({
      items: [
        {
          productId: 'product_1',
          variantId: 'variant_1',
          name: 'Browser Name',
          quantity: 1,
          priceCents: 9999,
          provider: 'printify',
          printifyProductId: 'browser_printify_product',
          printifyVariantId: 999,
        },
      ],
      shippingInfo: { email: 'ada@example.com' },
    }),
  });
}

function hiddenProduct() {
  return {
    id: 'product_1',
    name: 'Hidden Product',
    description: null,
    primaryImageUrl: null,
    active: true,
    visible: false,
    printifyProductId: 'printify_product_1',
    integrationRef: 'printify:printify_product_1',
    ProductVariant: [
      {
        id: 'variant_1',
        productId: 'product_1',
        isEnabled: true,
        inStock: true,
        priceCents: 2500,
        currency: 'USD',
        printifyVariantId: 101,
      },
    ],
  };
}

function merchizeProduct() {
  return {
    ...hiddenProduct(),
    visible: true,
    name: 'Merchize Product',
    printifyProductId: null,
    integrationRef: 'merchize:mz_1',
    ProductVariant: [
      {
        ...hiddenProduct().ProductVariant[0],
        printifyVariantId: null,
        providerVariantId: 'MZ-1',
      },
    ],
  };
}

describe('checkout session safety gates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user_1' } as never);
  });

  it('/api/v1/checkout/session rejects hidden products before Stripe', async () => {
    vi.mocked(prisma.product.findUnique).mockResolvedValue(hiddenProduct() as never);
    const mod = await import('../../app/api/v1/checkout/session/route');

    const response = await mod.POST(request('http://localhost/api/v1/checkout/session'));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toMatch(/no longer available/i);
    expect(stripeSessionCreate).not.toHaveBeenCalled();
  });

  it('/api/v1/checkout/session rejects non-Printify products before Stripe', async () => {
    vi.mocked(prisma.product.findUnique).mockResolvedValue(merchizeProduct() as never);
    const mod = await import('../../app/api/v1/checkout/session/route');

    const response = await mod.POST(request('http://localhost/api/v1/checkout/session'));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toMatch(/no longer available/i);
    expect(stripeSessionCreate).not.toHaveBeenCalled();
  });

  it('/api/checkout/session rejects hidden products before Stripe', async () => {
    vi.mocked(db.product.findUnique).mockResolvedValue(hiddenProduct() as never);
    const mod = await import('../../app/api/checkout/session/route');

    const response = await mod.POST(request('http://localhost/api/checkout/session'));
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.code).toBe('PRODUCT_NOT_PUBLIC');
    expect(stripeSessionCreate).not.toHaveBeenCalled();
  });

  it('/api/checkout/session rejects non-Printify products before Stripe', async () => {
    vi.mocked(db.product.findUnique).mockResolvedValue(merchizeProduct() as never);
    const mod = await import('../../app/api/checkout/session/route');

    const response = await mod.POST(request('http://localhost/api/checkout/session'));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.code).toBe('UNSUPPORTED_PROVIDER');
    expect(stripeSessionCreate).not.toHaveBeenCalled();
  });
});
