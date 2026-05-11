import { describe, expect, it } from 'vitest';
import { getSellableCatalogItems, toSellableCatalogItem } from '@/lib/catalog/sellable';
import { serializeProduct, type CatalogProduct } from '@/lib/catalog/serialize';

function catalogProduct(overrides: Partial<CatalogProduct> = {}): CatalogProduct {
  return {
    id: 'prod-1',
    title: 'Buyable Poster',
    slug: 'buyable-poster',
    description: 'A poster',
    image: '/poster.jpg',
    images: ['/poster.jpg'],
    tags: [],
    category: null,
    categorySlug: null,
    price: 24,
    priceCents: 2400,
    priceRange: { min: 2400, max: 2400 },
    available: true,
    visible: true,
    active: true,
    provider: 'internal',
    variants: [
      {
        id: 'variant-1',
        title: 'Default',
        sku: null,
        price: 24,
        priceCents: 2400,
        inStock: true,
        isEnabled: true,
        printifyVariantId: 101,
        optionValues: [],
        previewImageUrl: null,
      },
    ],
    integrationRef: null,
    printifyProductId: null,
    blueprintId: null,
    printProviderId: null,
    lastSyncedAt: null,
    ...overrides,
  };
}

describe('sellable catalog contract', () => {
  it('accepts a serialized API product with price, image, and an enabled in-stock variant', () => {
    const serialized = serializeProduct({
      id: 'prod-1',
      name: 'Buyable Poster',
      description: 'A poster',
      primaryImageUrl: '/poster.jpg',
      tags: [],
      category: null,
      categorySlug: null,
      active: true,
      visible: true,
      integrationRef: null,
      printifyProductId: null,
      blueprintId: null,
      printProviderId: null,
      specs: {},
      lastSyncedAt: null,
      createdAt: new Date('2026-05-06T00:00:00.000Z'),
      updatedAt: new Date('2026-05-06T00:00:00.000Z'),
      ProductImage: [],
      ProductVariant: [
        {
          id: 'variant-1',
          productId: 'prod-1',
          title: 'Default',
          sku: null,
          priceCents: 2400,
          inStock: true,
          isEnabled: true,
          printifyVariantId: 101,
          optionValues: [],
          previewImageUrl: null,
          createdAt: new Date('2026-05-06T00:00:00.000Z'),
          updatedAt: new Date('2026-05-06T00:00:00.000Z'),
        },
      ],
    } as any);

    expect(toSellableCatalogItem(serialized)).toMatchObject({
      id: 'prod-1',
      image: '/poster.jpg',
      available: true,
      variants: [expect.objectContaining({ id: 'variant-1' })],
    });
  });

  it('filters the same contract the storefront uses before rendering product cards', () => {
    const visible = getSellableCatalogItems([
      catalogProduct({ id: 'sellable' }),
      catalogProduct({ id: 'missing-image', image: null, images: [] }),
      catalogProduct({ id: 'missing-price', price: null, priceCents: null, priceRange: { min: null, max: null } }),
      catalogProduct({ id: 'missing-variant', variants: [{ ...catalogProduct().variants[0], inStock: false }] }),
    ]);

    expect(visible.map((product) => product.id)).toEqual(['sellable']);
    expect(visible[0].image).toBe('/poster.jpg');
    expect(visible[0].variants).toHaveLength(1);
  });
});
