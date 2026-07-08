import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { serializeProduct } from '@/lib/catalog/serialize';
import { resolveCatalogProvider } from '@/lib/catalog/provider';

function product(overrides: Record<string, unknown> = {}) {
  return {
    id: 'product-1',
    name: 'Sakura Tee',
    description: 'A tee for travelers.',
    primaryImageUrl: 'https://example.com/image.png',
    stripeProductId: null,
    printifyProductId: 'printify-product-1',
    active: true,
    category: 'Apparel',
    isNSFW: false,
    categorySlug: 'apparel',
    integrationRef: 'printify:printify-product-1',
    visible: true,
    blueprintId: 1,
    printProviderId: 2,
    tags: ['apparel'],
    options: null,
    specs: null,
    lastSyncedAt: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ProductImage: [
      {
        id: 'image-1',
        productId: 'product-1',
        url: 'https://example.com/image.png',
        position: 0,
        variantIds: [101],
        isDefault: true,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
      },
    ],
    ProductVariant: [
      {
        id: 'variant-1',
        productId: 'product-1',
        previewImageUrl: null,
        printifyVariantId: 101,
        providerVariantId: '101',
        printProviderName: '2',
        title: 'Small',
        sku: 'SKU-101',
        grams: 150,
        leadMinDays: null,
        leadMaxDays: null,
        isEnabled: true,
        inStock: true,
        priceCents: 2400,
        currency: 'USD',
        stripePriceId: null,
        isDefaultVariant: true,
        optionValues: [],
        costCents: null,
        lastSyncedAt: null,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
      },
    ],
    ...overrides,
  } as any;
}

describe('provider-neutral catalog identity', () => {
  it('resolves existing Printify products and exposes provider-neutral variant identity', () => {
    const serialized = serializeProduct(product());

    expect(serialized.provider).toBe('printify');
    expect(serialized.variants[0]).toMatchObject({
      provider: 'printify',
      printifyVariantId: 101,
      providerVariantId: '101',
    });
  });

  it('serializes Merchize-shaped products without requiring Printify variant IDs', () => {
    const serialized = serializeProduct(
      product({
        printifyProductId: null,
        integrationRef: 'merchize:merchize-product-1',
        blueprintId: null,
        printProviderId: null,
        ProductImage: [
          {
            id: 'image-1',
            productId: 'product-1',
            url: 'https://example.com/merchize.png',
            position: 0,
            variantIds: [],
            isDefault: true,
            createdAt: new Date('2026-01-01T00:00:00Z'),
            updatedAt: new Date('2026-01-01T00:00:00Z'),
          },
        ],
        ProductVariant: [
          {
            ...product().ProductVariant[0],
            printifyVariantId: null,
            providerVariantId: 'MZ-SKU-1',
            sku: 'MZ-SKU-1',
          },
        ],
      }),
    );

    expect(serialized.provider).toBe('merchize');
    expect(serialized.variants[0]).toMatchObject({
      provider: 'merchize',
      printifyVariantId: null,
      providerVariantId: 'MZ-SKU-1',
    });
  });

  it('uses the canonical provider resolver for integration references', () => {
    expect(resolveCatalogProvider({ printifyProductId: 'p1', integrationRef: null })).toBe(
      'printify',
    );
    expect(resolveCatalogProvider({ printifyProductId: null, integrationRef: 'printify:p1' })).toBe(
      'printify',
    );
    expect(resolveCatalogProvider({ printifyProductId: null, integrationRef: 'merchize:m1' })).toBe(
      'merchize',
    );
    expect(resolveCatalogProvider({ printifyProductId: null, integrationRef: null })).toBe(
      'internal',
    );
  });

  it('keeps ProductImage.variantIds compatible and adds product-scoped providerVariantId uniqueness', () => {
    const schema = fs.readFileSync(path.join(process.cwd(), 'prisma/schema.prisma'), 'utf8');

    expect(schema).toContain('variantIds Int[]');
    expect(schema).toContain('providerVariantId String?');
    expect(schema).toContain('@@unique([productId, providerVariantId])');
    expect(schema).toContain('@@unique([productId, printifyVariantId])');
  });
});
