import { beforeEach, describe, expect, it, vi } from 'vitest';

const dbMocks = vi.hoisted(() => {
  const tx = {
    product: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    productImage: {
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
    productVariant: {
      upsert: vi.fn(),
      updateMany: vi.fn(),
    },
  };
  const db = {
    $transaction: vi.fn(async (callback: (transaction: typeof tx) => Promise<void>) =>
      callback(tx),
    ),
    product: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
    },
    productVariant: {
      count: vi.fn(),
    },
  };

  return { db, tx };
});

const loggerMock = vi.hoisted(() => ({
  error: vi.fn(),
}));

vi.mock('@/app/lib/db', () => ({
  db: dbMocks.db,
}));

vi.mock('@/env/server', () => ({
  env: {
    PRINTIFY_SHOP_ID: 'test-shop',
  },
}));

vi.mock('@/app/lib/logger', () => ({
  logger: loggerMock,
}));

import { syncPrintifyProducts } from '@/lib/catalog/printifySync';
import type { PrintifyProduct } from '@/app/lib/printify/service';

function variant(
  id: number,
  overrides: Partial<PrintifyProduct['variants'][number]> = {},
): PrintifyProduct['variants'][number] {
  return {
    id,
    price: 2500,
    title: `Variant ${id}`,
    sku: `sku-${id}`,
    grams: 180,
    is_enabled: true,
    is_default: id === 1,
    is_available: true,
    is_printify_express_eligible: false,
    options: [],
    ...overrides,
  };
}

function product(id: string, overrides: Partial<PrintifyProduct> = {}): PrintifyProduct {
  return {
    id,
    title: `Product ${id}`,
    description: 'A test product.',
    tags: ['shirt'],
    options: [],
    variants: [variant(1)],
    images: [
      {
        src: `https://images.example/${id}-default.webp`,
        variant_ids: [],
        position: 'front',
        is_default: true,
      },
    ],
    visible: true,
    blueprint_id: 1,
    print_provider_id: 2,
    user_id: 3,
    shop_id: 4,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    is_locked: false,
    is_printify_express_eligible: false,
    is_economy_shipping_eligible: false,
    is_economy_shipping_enabled: false,
    ...overrides,
  };
}

function rawMatrixProduct() {
  const variants = Array.from({ length: 560 }, (_, index) =>
    variant(index + 1, {
      is_enabled: index < 48,
      is_available: index < 47,
      is_default: index === 0,
    }),
  );

  return product('minimal-cleavage-code-tee', {
    title: 'Minimal Cleavage Code Tee',
    variants,
    images: [
      {
        src: 'https://images.example/default.webp',
        variant_ids: [],
        position: 'front',
        is_default: true,
      },
      {
        src: 'https://images.example/selected.webp',
        variant_ids: [1, 2],
        position: 'front',
        is_default: false,
      },
      {
        src: 'https://images.example/disabled.webp',
        variant_ids: [500],
        position: 'front',
        is_default: false,
      },
      {
        src: 'https://images.example/selected.webp',
        variant_ids: [3],
        position: 'front',
        is_default: false,
      },
    ],
  });
}

describe('syncPrintifyProducts selected-variant import', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.tx.product.findUnique.mockResolvedValue(null);
    dbMocks.tx.product.upsert.mockImplementation(({ where }) =>
      Promise.resolve({ id: `db-${where.printifyProductId}`, printProviderId: 2 }),
    );
    dbMocks.tx.productImage.upsert.mockResolvedValue({});
    dbMocks.tx.productImage.deleteMany.mockResolvedValue({ count: 0 });
    dbMocks.tx.productVariant.upsert.mockResolvedValue({});
    dbMocks.tx.productVariant.updateMany.mockResolvedValue({ count: 0 });
    dbMocks.db.product.findMany.mockResolvedValue([]);
    dbMocks.db.product.updateMany.mockResolvedValue({ count: 0 });
    dbMocks.db.product.count.mockResolvedValue(0);
    dbMocks.db.productVariant.count.mockResolvedValue(0);
  });

  it('syncs only the 48 merchant-selected variants from a 560-variant matrix', async () => {
    const result = await syncPrintifyProducts([rawMatrixProduct()], {
      hideMissing: false,
      requestId: 'req_test_selected',
    });

    expect(result.upserted).toBe(1);
    expect(dbMocks.tx.productVariant.upsert).toHaveBeenCalledTimes(48);
    expect(dbMocks.tx.productVariant.updateMany).toHaveBeenCalledWith({
      where: {
        productId: 'db-minimal-cleavage-code-tee',
        printifyVariantId: { notIn: Array.from({ length: 48 }, (_, index) => index + 1) },
      },
      data: {
        isEnabled: false,
        inStock: false,
      },
    });
  });

  it('preserves selected out-of-stock variants as enabled but not in stock', async () => {
    await syncPrintifyProducts([rawMatrixProduct()], { hideMissing: false });

    expect(dbMocks.tx.productVariant.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          printifyVariantId: 48,
          isEnabled: true,
          inStock: false,
        }),
        update: expect.objectContaining({
          isEnabled: true,
          inStock: false,
        }),
      }),
    );
  });

  it('does not create ProductVariant rows for disabled raw blueprint variants', async () => {
    await syncPrintifyProducts([rawMatrixProduct()], { hideMissing: false });

    const createdVariantIds = dbMocks.tx.productVariant.upsert.mock.calls.map(
      ([call]) => call.create.printifyVariantId,
    );
    expect(createdVariantIds).not.toContain(49);
    expect(createdVariantIds).not.toContain(560);
  });

  it('uses atomic product-scoped variant upserts for selected variants', async () => {
    await syncPrintifyProducts([product('tee', { variants: [variant(101)] })], {
      hideMissing: false,
    });

    expect(dbMocks.tx.productVariant.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          productId_printifyVariantId: {
            productId: 'db-tee',
            printifyVariantId: 101,
          },
        },
      }),
    );
  });

  it('filters images to defaults and selected-variant images with URL de-duplication', async () => {
    await syncPrintifyProducts([rawMatrixProduct()], { hideMissing: false });

    const imageUrls = dbMocks.tx.productImage.upsert.mock.calls.map(([call]) => call.create.url);
    expect(imageUrls).toEqual([
      'https://images.example/default.webp',
      'https://images.example/selected.webp',
    ]);
    expect(imageUrls).not.toContain('https://images.example/disabled.webp');
  });

  it('keeps a first-image fallback when selected/default filtering would leave no image', async () => {
    await syncPrintifyProducts([
      product('fallback-image', {
        variants: [variant(101)],
        images: [
          {
            src: 'https://images.example/fallback.webp',
            variant_ids: [999],
            position: 'front',
            is_default: false,
          },
        ],
      }),
    ]);

    expect(dbMocks.tx.productImage.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          url: 'https://images.example/fallback.webp',
        }),
      }),
    );
  });

  it('keeps repeated titles as separate products when Printify product IDs differ', async () => {
    await syncPrintifyProducts([
      product('sneakers-a', { title: "Ryuko Inspired Women's Mesh Sneakers" }),
      product('sneakers-b', { title: "Ryuko Inspired Women's Mesh Sneakers" }),
    ]);

    expect(dbMocks.tx.product.upsert).toHaveBeenCalledTimes(2);
    expect(dbMocks.tx.product.upsert).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ where: { printifyProductId: 'sneakers-a' } }),
    );
    expect(dbMocks.tx.product.upsert).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ where: { printifyProductId: 'sneakers-b' } }),
    );
  });

  it('preserves a locally hidden product during provider sync', async () => {
    dbMocks.tx.product.findUnique.mockResolvedValueOnce({ active: true, visible: false });

    await syncPrintifyProducts([product('hidden-product', { visible: true })], {
      hideMissing: false,
    });

    expect(dbMocks.tx.product.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          active: true,
          visible: false,
        }),
      }),
    );
  });

  it('preserves a locally archived product during provider sync', async () => {
    dbMocks.tx.product.findUnique.mockResolvedValueOnce({ active: false, visible: false });

    await syncPrintifyProducts([product('archived-product', { visible: true })], {
      hideMissing: false,
    });

    expect(dbMocks.tx.product.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          active: false,
          visible: false,
        }),
      }),
    );
  });

  it('reports fifteen updates and one insert through preflight-compatible existing records', async () => {
    dbMocks.db.product.findMany.mockResolvedValue(
      Array.from({ length: 15 }, (_, index) => ({
        printifyProductId: `printify-product-${index + 1}`,
      })),
    );

    const existing = Array.from({ length: 15 }, (_, index) =>
      product(`printify-product-${index + 1}`),
    );
    const missing = product('minimal-cleavage-code-tee');

    await syncPrintifyProducts([...existing, missing], { hideMissing: false });

    expect(dbMocks.tx.product.upsert).toHaveBeenCalledTimes(16);
    expect(dbMocks.db.product.updateMany).not.toHaveBeenCalled();
  });

  it('continues after one product failure and logs sanitized product context', async () => {
    dbMocks.tx.productVariant.upsert
      .mockRejectedValueOnce(new Error('database timeout with hidden details'))
      .mockResolvedValue({});

    const result = await syncPrintifyProducts([product('failed-product'), product('ok-product')], {
      hideMissing: false,
      requestId: 'req_failure_context',
    });

    expect(result.upserted).toBe(1);
    expect(result.errors).toEqual(['Product failed-product: Error']);
    expect(loggerMock.error).toHaveBeenCalledWith(
      'printify_catalog_sync_product_failed',
      expect.objectContaining({
        requestId: 'req_failure_context',
        extra: expect.objectContaining({
          printifyProductId: 'failed-product',
          selectedVariantCount: 1,
          rawVariantCount: 1,
          failureCategory: 'Error',
        }),
      }),
    );
  });

  it('is idempotent across repeated syncs without hiding products by default', async () => {
    await syncPrintifyProducts([product('idempotent')], { hideMissing: false });
    await syncPrintifyProducts([product('idempotent')], { hideMissing: false });

    expect(dbMocks.tx.product.upsert).toHaveBeenCalledTimes(2);
    expect(dbMocks.tx.productVariant.upsert).toHaveBeenCalledTimes(2);
    expect(dbMocks.db.product.updateMany).not.toHaveBeenCalled();
  });
});
