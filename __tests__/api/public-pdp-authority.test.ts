import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/app/lib/db';
import { serializeProduct } from '@/lib/catalog/serialize';

vi.mock('@/app/lib/db', () => ({
  db: { product: { findUnique: vi.fn(), findFirst: vi.fn() } },
}));
vi.mock('@/lib/catalog/serialize', () => ({ serializeProduct: vi.fn() }));
vi.mock('@/lib/catalog/e2eFallback', () => ({ getCatalogFallbackProduct: vi.fn(() => undefined) }));

const product = {
  id: 'product_1',
  title: 'Sakura Tee',
  slug: 'sakura-tee',
  description: '',
  image: '/product.webp',
  images: ['/product.webp'],
  tags: [],
  category: 'apparel',
  categorySlug: 'apparel',
  price: 29,
  priceCents: 2900,
  priceRange: { min: 2900, max: 2900 },
  available: true,
  visible: true,
  active: true,
  provider: 'printify',
  variants: [{
    id: 'variant_1', provider: 'printify', providerVariantId: '101', title: 'Small', sku: 'S',
    price: 29, priceCents: 2900, inStock: true, isEnabled: true, printifyVariantId: 101,
    optionValues: [], previewImageUrl: null,
  }],
  integrationRef: 'printify:product_1', printifyProductId: 'product_1', blueprintId: 1,
  printProviderId: 1, lastSyncedAt: null,
};

describe('public PDP authority', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.product.findUnique).mockResolvedValue({ lastSyncedAt: null } as never);
    vi.mocked(serializeProduct).mockReturnValue(product as never);
  });

  it('serves the same buy-ready product shape used by the public catalogue', async () => {
    const { GET } = await import('@/app/api/v1/products/[id]/route');
    const response = await GET(new NextRequest('http://localhost/api/v1/products/product_1'), {
      params: Promise.resolve({ id: 'product_1' }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      data: { id: 'product_1', provider: 'printify' },
    });
  });

  it('does not expose a direct PDP for an unsupported provider', async () => {
    vi.mocked(serializeProduct).mockReturnValue({ ...product, provider: 'merchize' } as never);
    const { GET } = await import('@/app/api/v1/products/[id]/route');
    const response = await GET(new NextRequest('http://localhost/api/v1/products/product_1'), {
      params: Promise.resolve({ id: 'product_1' }),
    });

    expect(response.status).toBe(404);
  });
});
