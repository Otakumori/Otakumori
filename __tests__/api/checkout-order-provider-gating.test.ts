import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { auth } from '@clerk/nextjs/server';
import { createPrintifyOrder } from '@/app/lib/printify/printifyClient';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

vi.mock('@/env', () => ({
  env: {
    PRINTIFY_SHOP_ID: 'shop_123',
  },
}));

vi.mock('@/lib/db', () => ({
  db: {
    product: {
      findUnique: vi.fn(),
    },
    printifyOrderSync: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/app/lib/printify/printifyClient', () => ({
  createPrintifyOrder: vi.fn(),
}));

vi.mock('@/app/lib/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { db } from '@/lib/db';

function request(body: unknown) {
  return new NextRequest('http://localhost/api/v1/checkout/order', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    orderId: 'order_1',
    lineItems: [
      {
        provider: 'printify',
        productId: 'product_1',
        printifyProductId: 'printify_product_1',
        variantId: 'variant_1',
        printifyVariantId: 101,
        quantity: 1,
      },
    ],
    shippingMethod: 1,
    shippingAddress: {
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      phone: '5555555555',
      country: 'US',
      region: 'CA',
      address1: '1 Test St',
      city: 'Los Angeles',
      zip: '90001',
    },
    ...overrides,
  };
}

describe('legacy direct Printify checkout gating', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user_1' } as never);
    vi.mocked(createPrintifyOrder).mockResolvedValue({ id: 'printify_order_1' } as never);
    vi.mocked(db.product.findUnique).mockResolvedValue({
      id: 'product_1',
      name: 'Printify Product',
      description: null,
      primaryImageUrl: null,
      active: true,
      visible: true,
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
          providerVariantId: '101',
        },
      ],
    } as never);
  });

  it('fails closed even for valid-looking direct fulfillment requests', async () => {
    const mod = await import('../../app/api/v1/checkout/order/route');

    const response = await mod.POST(request(validBody()));
    const json = await response.json();

    expect(response.status).toBe(410);
    expect(json.error).toMatch(/Direct fulfillment is disabled/i);
    expect(createPrintifyOrder).not.toHaveBeenCalled();
  });

  it('does not allow Merchize/provider-neutral items to reach direct fulfillment', async () => {
    const mod = await import('../../app/api/v1/checkout/order/route');

    const response = await mod.POST(
      request(
        validBody({
          lineItems: [
            {
              provider: 'merchize',
              productId: 'product_1',
              variantId: 'variant_1',
              quantity: 1,
            },
          ],
        }),
      ),
    );
    const json = await response.json();

    expect(response.status).toBe(410);
    expect(json.error).toMatch(/Direct fulfillment is disabled/i);
    expect(createPrintifyOrder).not.toHaveBeenCalled();
  });

  it('does not expose a direct fallback for incomplete Printify mappings', async () => {
    vi.mocked(db.product.findUnique).mockResolvedValue({
      id: 'product_1',
      name: 'Printify Product',
      active: true,
      visible: true,
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
          printifyVariantId: null,
        },
      ],
    } as never);
    const mod = await import('../../app/api/v1/checkout/order/route');

    const response = await mod.POST(
      request(
        validBody({
          lineItems: [
            {
              provider: 'printify',
              productId: 'product_1',
              variantId: 'variant_1',
              quantity: 1,
            },
          ],
        }),
      ),
    );
    const json = await response.json();

    expect(response.status).toBe(410);
    expect(json.error).toMatch(/Direct fulfillment is disabled/i);
    expect(createPrintifyOrder).not.toHaveBeenCalled();
  });

  it('does not trust a browser-supplied provider claim', async () => {
    vi.mocked(db.product.findUnique).mockResolvedValue({
      id: 'product_1',
      name: 'Merchize Product',
      active: true,
      visible: true,
      printifyProductId: null,
      integrationRef: 'merchize:mz_1',
      ProductVariant: [
        {
          id: 'variant_1',
          productId: 'product_1',
          isEnabled: true,
          inStock: true,
          priceCents: 2500,
          currency: 'USD',
          printifyVariantId: null,
          providerVariantId: 'MZ-1',
        },
      ],
    } as never);
    const mod = await import('../../app/api/v1/checkout/order/route');

    const response = await mod.POST(request(validBody()));
    const json = await response.json();

    expect(response.status).toBe(410);
    expect(json.error).toMatch(/Direct fulfillment is disabled/i);
    expect(createPrintifyOrder).not.toHaveBeenCalled();
  });
});
