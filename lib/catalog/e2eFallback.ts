import { env } from '@/env.mjs';
import type { CatalogProduct } from './serialize';

export const E2E_FALLBACK_PRODUCT_ID = 'e2e-sakura-starter-tee';

export function shouldUseE2ECatalogFallback() {
  return env.CI === 'true' || env.NODE_ENV === 'test';
}

export function getE2EFallbackProduct(id: string): CatalogProduct | undefined {
  if (!shouldUseE2ECatalogFallback()) return undefined;
  return getE2EFallbackProducts().find((item) => item.id === id || item.slug === id);
}

export function getE2EFallbackProducts(): CatalogProduct[] {
  return [
    {
      id: E2E_FALLBACK_PRODUCT_ID,
      title: 'Sakura Starter Tee',
      slug: E2E_FALLBACK_PRODUCT_ID,
      description: 'Stable CI storefront product used when live catalog data is unavailable.',
      image: '/assets/bg/5nighttree.png',
      images: ['/assets/bg/5nighttree.png'],
      tags: ['apparel', 'sakura'],
      category: 'apparel',
      categorySlug: 'apparel',
      price: 29,
      priceCents: 2900,
      priceRange: { min: 2900, max: 2900 },
      available: true,
      visible: true,
      active: true,
      provider: 'internal',
      variants: [
        {
          id: `${E2E_FALLBACK_PRODUCT_ID}-variant`,
          title: 'Default',
          sku: 'E2E-SAKURA-TEE',
          price: 29,
          priceCents: 2900,
          inStock: true,
          isEnabled: true,
          printifyVariantId: 0,
          optionValues: [],
          previewImageUrl: '/assets/bg/5nighttree.png',
        },
      ],
      integrationRef: null,
      printifyProductId: null,
      blueprintId: null,
      printProviderId: null,
      lastSyncedAt: null,
    },
  ];
}
