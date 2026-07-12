import { env } from '@/env.mjs';
import type { CatalogProduct } from './serialize';

export const E2E_FALLBACK_PRODUCT_ID = 'e2e-sakura-starter-tee';
const E2E_FALLBACK_IMAGE = '/assets/images/cherry-tree@1x.webp';

function readRuntimeEnv(key: string): string | undefined {
  return typeof globalThis.process === 'undefined' ? undefined : globalThis.process.env?.[key];
}

export function shouldUseE2ECatalogFallback() {
  return env.CI === 'true' || env.NODE_ENV === 'test';
}

export function shouldUseCatalogFallback() {
  return (
    shouldUseE2ECatalogFallback() ||
    readRuntimeEnv('VERCEL_ENV') === 'preview' ||
    readRuntimeEnv('VERCEL_ENVIRONMENT') === 'preview'
  );
}

export function getE2EFallbackProduct(id: string): CatalogProduct | undefined {
  if (!shouldUseE2ECatalogFallback()) return undefined;
  return getE2EFallbackProducts().find((item) => item.id === id || item.slug === id);
}

export function getCatalogFallbackProduct(id: string): CatalogProduct | undefined {
  if (!shouldUseCatalogFallback()) return undefined;
  return getE2EFallbackProducts().find((item) => item.id === id || item.slug === id);
}

export function getE2EFallbackProducts(): CatalogProduct[] {
  return [
    {
      id: E2E_FALLBACK_PRODUCT_ID,
      title: 'Sakura Starter Tee',
      slug: E2E_FALLBACK_PRODUCT_ID,
      description: 'Stable CI storefront product used when live catalog data is unavailable.',
      image: E2E_FALLBACK_IMAGE,
      images: [E2E_FALLBACK_IMAGE],
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
          provider: 'internal',
          providerVariantId: `${E2E_FALLBACK_PRODUCT_ID}-variant`,
          title: 'Default',
          sku: 'E2E-SAKURA-TEE',
          price: 29,
          priceCents: 2900,
          inStock: true,
          isEnabled: true,
          printifyVariantId: 0,
          optionValues: [],
          previewImageUrl: E2E_FALLBACK_IMAGE,
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
