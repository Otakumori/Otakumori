import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/lib/db';
import { createPrintifyOrder } from '@/lib/fulfillment/printify';

vi.mock('@/env', () => ({
  env: {
    PRINTIFY_API_URL: 'https://api.printify.example',
    PRINTIFY_SHOP_ID: 'shop_123',
    PRINTIFY_API_KEY: 'test-key',
  },
}));

vi.mock('@/lib/db', () => ({
  db: {
    orderItem: {
      findMany: vi.fn(),
    },
    printifyOrderSync: {
      upsert: vi.fn(),
    },
    order: {
      update: vi.fn(),
    },
  },
}));

function stripeSession() {
  return {
    shipping_details: {
      name: 'Ada Lovelace',
      address: {
        country: 'US',
        state: 'CA',
        city: 'Los Angeles',
        line1: '1 Test St',
        postal_code: '90001',
      },
    },
    customer_details: {
      email: 'ada@example.com',
      phone: '5555555555',
    },
  };
}

function orderItem(overrides: Record<string, unknown> = {}) {
  return {
    id: 'item_1',
    orderId: 'order_1',
    quantity: 1,
    printifyProductId: 'printify_product_1',
    printifyVariantId: 101,
    Product: {
      id: 'product_1',
      active: true,
      visible: true,
      printifyProductId: 'printify_product_1',
      integrationRef: 'printify:printify_product_1',
    },
    ProductVariant: {
      id: 'variant_1',
      isEnabled: true,
      inStock: true,
      printifyVariantId: 101,
    },
    ...overrides,
  };
}

describe('Printify fulfillment safety', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify({ id: 'printify_order_1', status: 'ok' })),
      }),
    );
  });

  it('does not call Printify for non-Printify order items', async () => {
    vi.mocked(db.orderItem.findMany).mockResolvedValue([
      orderItem({
        printifyProductId: null,
        printifyVariantId: null,
        Product: {
          id: 'product_1',
          active: true,
          visible: true,
          printifyProductId: null,
          integrationRef: 'merchize:mz_1',
        },
        ProductVariant: {
          id: 'variant_1',
          isEnabled: true,
          inStock: true,
          printifyVariantId: null,
        },
      }),
    ] as never);

    const result = await createPrintifyOrder('order_1', stripeSession());

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Missing Printify mappings/i);
    expect(fetch).not.toHaveBeenCalled();
    expect(db.printifyOrderSync.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ status: 'mapping_failed' }),
      }),
    );
  });

  it('keeps existing mapped Printify fulfillment path intact', async () => {
    vi.mocked(db.orderItem.findMany).mockResolvedValue([orderItem()] as never);
    vi.mocked(db.order.update).mockResolvedValue({} as never);
    vi.mocked(db.printifyOrderSync.upsert).mockResolvedValue({} as never);

    const result = await createPrintifyOrder('order_1', stripeSession());

    expect(result.ok).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(db.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ printifyId: 'printify_order_1' }),
      }),
    );
  });
});
