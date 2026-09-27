import { describe, expect, it } from 'vitest';
import type { CatalogProduct } from '@/lib/catalog/serialize';
import { toPublicCatalogProduct } from '@/lib/catalog/publicProduct';

const product: CatalogProduct = {
  id: 'product_1',
  title: 'Sakura Tee',
  slug: 'sakura-tee',
  description: 'A buy-ready product.',
  image: 'https://images-api.printify.com/product.webp',
  images: ['https://images-api.printify.com/product.webp'],
  tags: ['apparel'],
  category: 'Apparel',
  categorySlug: 'apparel',
  price: 29,
  priceCents: 2900,
  priceRange: { min: 2900, max: 2900 },
  available: true,
  visible: true,
  active: true,
  provider: 'printify',
  variants: [
    {
      id: 'variant_1',
      provider: 'printify',
      providerVariantId: '101',
      title: 'Small',
      sku: 'SAKURA-S',
      price: 29,
      priceCents: 2900,
      inStock: true,
      isEnabled: true,
      printifyVariantId: 101,
      optionValues: [],
      previewImageUrl: null,
    },
  ],
  integrationRef: 'printify:product_1',
  printifyProductId: 'product_1',
  blueprintId: 1,
  printProviderId: 1,
  lastSyncedAt: null,
};

describe('public catalogue product authority', () => {
  it('returns only public, sellable Printify products', () => {
    expect(toPublicCatalogProduct(product)?.id).toBe('product_1');
  });

  it.each([
    ['hidden', { visible: false }],
    ['archived', { active: false }],
    ['unsupported provider', { provider: 'merchize' }],
    ['unavailable variant', { variants: [{ ...product.variants[0], inStock: false }] }],
    ['zero priced variant', { variants: [{ ...product.variants[0], priceCents: 0 }] }],
  ])('rejects a %s product from public PDP and storefront authority', (_name, patch) => {
    expect(toPublicCatalogProduct({ ...product, ...patch } as CatalogProduct)).toBeNull();
  });
});
