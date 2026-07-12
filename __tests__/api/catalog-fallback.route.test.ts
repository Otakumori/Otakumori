import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  loggerError: vi.fn(),
}));

vi.mock('@/app/lib/db', () => ({
  db: {
    product: {
      findMany: mocks.findMany,
    },
  },
}));

vi.mock('@/app/lib/logger', () => ({
  logger: {
    error: mocks.loggerError,
  },
}));

function fallbackProduct() {
  return {
    id: 'e2e-sakura-starter-tee',
    title: 'Sakura Starter Tee',
    slug: 'e2e-sakura-starter-tee',
    description: 'Stable CI storefront product used when live catalog data is unavailable.',
    image: '/assets/images/cherry-tree@1x.webp',
    images: ['/assets/images/cherry-tree@1x.webp'],
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
        id: 'e2e-sakura-starter-tee-variant',
        provider: 'internal',
        providerVariantId: 'e2e-sakura-starter-tee-variant',
        title: 'Default',
        sku: 'E2E-SAKURA-TEE',
        price: 29,
        priceCents: 2900,
        inStock: true,
        isEnabled: true,
        printifyVariantId: 0,
        optionValues: [],
        previewImageUrl: '/assets/images/cherry-tree@1x.webp',
      },
    ],
    integrationRef: null,
    printifyProductId: null,
    blueprintId: null,
    printProviderId: null,
    lastSyncedAt: null,
  };
}

async function loadCatalogRoute(options: { fallbackEnabled: boolean }) {
  vi.resetModules();
  vi.doMock('@/lib/catalog/e2eFallback', () => ({
    getE2EFallbackProducts: vi.fn(() => [fallbackProduct()]),
    shouldUseCatalogFallback: vi.fn(() => options.fallbackEnabled),
  }));

  return import('../../app/api/v1/catalog/route');
}

describe('/api/v1/catalog fallback behavior', () => {
  beforeEach(() => {
    mocks.findMany.mockReset();
    mocks.loggerError.mockReset();
  });

  it('returns explicit Preview/CI fallback without touching Prisma or logging an error', async () => {
    const { GET } = await loadCatalogRoute({ fallbackEnabled: true });

    const response = await GET(new NextRequest('http://localhost/api/v1/catalog?limit=20'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('x-otm-source')).toBe('ci-fallback');
    expect(body.data.products).toHaveLength(1);
    expect(body.data.products[0].provider).toBe('internal');
    expect(mocks.findMany).not.toHaveBeenCalled();
    expect(mocks.loggerError).not.toHaveBeenCalled();
  });

  it('still fails loudly when fallback mode is not enabled', async () => {
    mocks.findMany.mockRejectedValueOnce(new Error('database unavailable'));
    const { GET } = await loadCatalogRoute({ fallbackEnabled: false });

    const response = await GET(new NextRequest('http://localhost/api/v1/catalog?limit=20'));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(response.headers.get('x-otm-source')).toBeNull();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('INTERNAL_ERROR');
    expect(mocks.findMany).toHaveBeenCalledTimes(1);
    expect(mocks.loggerError).toHaveBeenCalledWith(
      'Catalog API error',
      expect.objectContaining({ route: '/api/v1/catalog' }),
      undefined,
      expect.any(Error),
    );
  });
});
