import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/app/lib/db';
import { getPrintifyService } from '@/app/lib/printify/service';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

vi.mock('@/app/lib/db', () => ({
  db: {
    product: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('@/app/lib/printify/service', () => ({
  getPrintifyService: vi.fn(),
}));

vi.mock('@/app/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

function adminSession() {
  vi.mocked(auth).mockResolvedValue({
    userId: 'admin_123',
    sessionClaims: { metadata: { role: 'admin' } },
  } as never);
}

async function productsRoute() {
  return import('../../app/api/admin/products/route');
}

async function printifyProductRoute() {
  return import('../../app/api/admin/printify/products/[productId]/route');
}

async function productDetailRoute() {
  return import('../../app/api/v1/products/[id]/route');
}

async function callAdminProductsGET(path = '/api/admin/products') {
  const mod = await productsRoute();
  const request = new NextRequest(`http://localhost${path}`, { method: 'GET' });
  const response = await mod.GET(request);
  return { response, json: await response.json() };
}

async function callAdminProductsPATCH(body: unknown) {
  const mod = await productsRoute();
  const request = new NextRequest('http://localhost/api/admin/products', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const response = await mod.PATCH(request);
  return { response, json: await response.json() };
}

const productRow = {
  id: 'product_1',
  name: 'Sakura Starter Tee',
  active: true,
  visible: true,
  printifyProductId: 'printify_1',
  integrationRef: 'printify:printify_1',
  primaryImageUrl: null,
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  lastSyncedAt: new Date('2026-01-01T00:00:00.000Z'),
  ProductImage: [{ url: 'https://images.example/sakura.webp' }],
  ProductVariant: [
    { isEnabled: true, inStock: true },
    { isEnabled: true, inStock: false },
  ],
  _count: { OrderItem: 2 },
};

describe('admin local product management API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminSession();
    vi.mocked(db.product.findMany).mockResolvedValue([productRow] as never);
    vi.mocked(db.product.updateMany).mockResolvedValue({ count: 2 } as never);
    vi.mocked(db.product.findUnique).mockResolvedValue(null as never);
    vi.mocked(db.product.findFirst).mockResolvedValue(null as never);
    vi.mocked(getPrintifyService).mockReturnValue({
      getProduct: vi.fn(),
      deleteProduct: vi.fn(),
    } as never);
  });

  it('requires authentication for local product management', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never);

    const { response, json } = await callAdminProductsGET();

    expect(response.status).toBe(401);
    expect(json.error).toBe('AUTH_REQUIRED');
    expect(db.product.findMany).not.toHaveBeenCalled();
  });

  it('requires admin role for local product management', async () => {
    vi.mocked(auth).mockResolvedValue({
      userId: 'user_123',
      sessionClaims: { role: 'authenticated' },
    } as never);

    const { response, json } = await callAdminProductsGET();

    expect(response.status).toBe(403);
    expect(json.error).toBe('FORBIDDEN');
    expect(db.product.findMany).not.toHaveBeenCalled();
  });

  it('lists products with provider, visibility status, availability, and order count', async () => {
    const { response, json } = await callAdminProductsGET(
      '/api/admin/products?status=visible&provider=printify&q=sakura',
    );

    expect(response.status).toBe(200);
    expect(json.data.products).toEqual([
      expect.objectContaining({
        id: 'product_1',
        title: 'Sakura Starter Tee',
        provider: 'printify',
        status: 'visible',
        available: true,
        sellableVariantCount: 1,
        historicalOrderCount: 2,
        image: 'https://images.example/sakura.webp',
      }),
    ]);
    expect(db.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          active: true,
          visible: true,
        }),
      }),
    );
  });

  it.each([
    ['hide', { active: true, visible: false }],
    ['restore', { active: true, visible: true }],
    ['archive', { active: false, visible: false }],
  ] as const)('applies %s as a local-only bulk product action', async (action, data) => {
    const { response, json } = await callAdminProductsPATCH({
      action,
      productIds: ['product_1', 'product_2'],
    });

    expect(response.status).toBe(200);
    expect(json.data.updatedCount).toBe(2);
    expect(db.product.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['product_1', 'product_2'] } },
      data,
    });
    expect(getPrintifyService).not.toHaveBeenCalled();
  });

  it('rejects malformed bulk actions without mutating products', async () => {
    const { response, json } = await callAdminProductsPATCH({
      action: 'delete-provider-product',
      productIds: ['product_1'],
    });

    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid product action');
    expect(db.product.updateMany).not.toHaveBeenCalled();
  });

  it('disables provider-side Printify product deletion from admin routes', async () => {
    const mod = await printifyProductRoute();
    const service = { deleteProduct: vi.fn() };
    vi.mocked(getPrintifyService).mockReturnValue(service as never);
    const request = new NextRequest('http://localhost/api/admin/printify/products/printify_1', {
      method: 'DELETE',
    });

    const response = await mod.DELETE(request, {
      params: Promise.resolve({ productId: 'printify_1' }),
    });
    const json = await response.json();

    expect(response.status).toBe(405);
    expect(json.error).toMatch(/disabled/i);
    expect(service.deleteProduct).not.toHaveBeenCalled();
  });
});

describe('public product detail visibility enforcement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.product.findUnique).mockResolvedValue(null as never);
    vi.mocked(db.product.findFirst).mockResolvedValue(null as never);
    vi.mocked(getPrintifyService).mockReturnValue({
      getProduct: vi.fn(),
    } as never);
  });

  it('returns 404 for a hidden product found by local ID', async () => {
    vi.mocked(db.product.findUnique).mockResolvedValue({
      id: 'product_1',
      active: true,
      visible: false,
      ProductVariant: [],
      ProductImage: [],
    } as never);

    const mod = await productDetailRoute();
    const response = await mod.GET(new NextRequest('http://localhost/api/v1/products/product_1'), {
      params: Promise.resolve({ id: 'product_1' }),
    });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error.code).toBe('NOT_FOUND');
    expect(getPrintifyService).not.toHaveBeenCalled();
  });

  it('returns 404 for an archived product found by Printify ID before provider fallback', async () => {
    vi.mocked(db.product.findFirst).mockResolvedValue({
      id: 'product_1',
      active: false,
      visible: false,
      ProductVariant: [],
      ProductImage: [],
    } as never);

    const mod = await productDetailRoute();
    const response = await mod.GET(new NextRequest('http://localhost/api/v1/products/printify_1'), {
      params: Promise.resolve({ id: 'printify_1' }),
    });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error.code).toBe('NOT_FOUND');
    expect(getPrintifyService).not.toHaveBeenCalled();
  });
});
