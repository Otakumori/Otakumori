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

describe('Printify checkout provider gating', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user_1' } as never);
    vi.mocked(createPrintifyOrder).mockResolvedValue({ id: 'printify_order_1' } as never);
  });

  it('accepts valid Printify line items', async () => {
    const mod = await import('../../app/api/v1/checkout/order/route');

    const response = await mod.POST(request(validBody()));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(createPrintifyOrder).toHaveBeenCalledWith(
      'shop_123',
      expect.objectContaining({
        line_items: [
          expect.objectContaining({
            product_id: 'printify_product_1',
            variant_id: 101,
          }),
        ],
      }),
    );
  });

  it('rejects Merchize/provider-neutral items before Printify fulfillment', async () => {
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

    expect(response.status).toBe(400);
    expect(json.error).toMatch(/Unsupported fulfillment provider/i);
    expect(createPrintifyOrder).not.toHaveBeenCalled();
  });

  it('continues to require Printify product and variant IDs for Printify items', async () => {
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

    expect(response.status).toBe(400);
    expect(json.error).toMatch(/require Printify product and variant IDs/i);
    expect(createPrintifyOrder).not.toHaveBeenCalled();
  });
});
