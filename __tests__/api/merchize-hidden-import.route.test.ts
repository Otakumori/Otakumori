import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/app/lib/db';
import { getMerchizeService } from '@/app/lib/merchize/service';
import { limitApi } from '@/lib/ratelimit';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

vi.mock('@/app/lib/db', () => ({
  db: {
    product: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('@/app/lib/merchize/service', () => ({
  getMerchizeService: vi.fn(),
}));

vi.mock('@/lib/ratelimit', () => ({
  limitApi: vi.fn(),
}));

vi.mock('@/app/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/env.mjs', () => ({
  env: {
    UPSTASH_REDIS_REST_URL: '',
    UPSTASH_REDIS_REST_TOKEN: '',
  },
}));

function adminSession() {
  vi.mocked(auth).mockResolvedValue({
    userId: 'admin_123',
    sessionClaims: { metadata: { role: 'admin' } },
  } as never);
  vi.mocked(currentUser).mockResolvedValue({
    id: 'admin_123',
    primaryEmailAddress: { emailAddress: 'admin@example.com' },
    emailAddresses: [],
  } as never);
}

function nonAdminSession() {
  vi.mocked(auth).mockResolvedValue({
    userId: 'user_123',
    sessionClaims: { metadata: { role: 'viewer' }, role: 'authenticated' },
  } as never);
}

function noSession() {
  vi.mocked(auth).mockResolvedValue({ userId: null } as never);
}

function merchizeProduct(overrides: Record<string, unknown> = {}) {
  return {
    provider: 'merchize',
    providerProductId: 'mz-product-1',
    id: 'mz-product-1',
    title: 'Merchize Tee',
    description: 'A hidden import candidate',
    sku: 'MZ-TEE',
    handle: 'merchize-tee',
    status: 'active',
    currency: 'USD',
    price: 25,
    priceRange: { min: 25, max: 29, currency: 'USD' },
    images: [{ url: 'https://cdn.example.com/merchize-tee.png' }],
    variants: [
      {
        provider: 'merchize',
        providerVariantId: 'MZ-VARIANT-1',
        sku: 'MZ-TEE-S',
        title: 'Small',
        options: [{ option: 'Size', value: 'S' }],
        price: 25,
        currency: 'USD',
        inStock: true,
        availability: 'available',
        printifyVariantId: null,
      },
    ],
    variantCount: 1,
    pricedVariantCount: 1,
    imageCount: 1,
    warnings: [],
    importReadiness: { ready: true, issues: [] },
    ...overrides,
  };
}

function serviceMock(products = [merchizeProduct()], overrides: Record<string, unknown> = {}) {
  return {
    getProducts: vi.fn().mockResolvedValue(products),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    ...overrides,
  };
}

async function applyRoute() {
  return import('../../app/api/admin/merchize/import/apply/route');
}

async function callPOST(mod: Record<string, unknown>, body: unknown = { apply: true }) {
  const handler = mod.POST as (request: NextRequest) => Promise<Response>;
  const response = await handler(
    new NextRequest('http://localhost/api/admin/merchize/import/apply', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  );
  return { response, json: await response.json() };
}

describe('Merchize hidden local import apply route', () => {
  const tx = {
    product: {
      upsert: vi.fn(),
    },
    productVariant: {
      upsert: vi.fn(),
      updateMany: vi.fn(),
    },
    productImage: {
      upsert: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    adminSession();
    vi.mocked(limitApi).mockResolvedValue({
      success: true,
      limit: 20,
      remaining: 19,
      reset: Date.now() + 60_000,
    } as never);
    vi.mocked(db.product.findMany).mockResolvedValue([]);
    vi.mocked(db.$transaction).mockImplementation(async (callback: any) => callback(tx));
    tx.product.upsert.mockResolvedValue({ id: 'local-product-1' });
    vi.mocked(getMerchizeService).mockReturnValue(serviceMock() as never);
  });

  it('requires authentication', async () => {
    noSession();

    const { response, json } = await callPOST(await applyRoute());

    expect(response.status).toBe(401);
    expect(json.error).toBe('AUTH_REQUIRED');
  });

  it('requires admin authorization', async () => {
    nonAdminSession();

    const { response, json } = await callPOST(await applyRoute());

    expect(response.status).toBe(403);
    expect(json.error).toBe('FORBIDDEN');
  });

  it('requires explicit apply=true', async () => {
    const { response, json } = await callPOST(await applyRoute(), {});

    expect(response.status).toBe(400);
    expect(json.error.message).toMatch(/apply=true/i);
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it('refuses to apply when preflight is unsafe', async () => {
    vi.mocked(getMerchizeService).mockReturnValue(
      serviceMock([
        merchizeProduct({
          images: [],
          imageCount: 0,
          warnings: ['product_missing_images'],
          importReadiness: { ready: false, issues: ['product_missing_images'] },
        }),
      ]) as never,
    );

    const { response, json } = await callPOST(await applyRoute());

    expect(response.status).toBe(409);
    expect(json.error.message).toMatch(/not safe/i);
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it('inserts valid Merchize products as hidden and non-purchasable local records', async () => {
    const service = serviceMock();
    vi.mocked(getMerchizeService).mockReturnValue(service as never);

    const { response, json } = await callPOST(await applyRoute());

    expect(response.status).toBe(200);
    expect(json.data).toMatchObject({
      provider: 'merchize',
      mode: 'hidden_local_import',
      productCount: 1,
      inserted: 1,
      updated: 0,
      blocked: 0,
    });
    expect(tx.product.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { integrationRef: 'merchize:mz-product-1' },
        create: expect.objectContaining({
          integrationRef: 'merchize:mz-product-1',
          printifyProductId: null,
          active: false,
          visible: false,
        }),
        update: expect.objectContaining({
          printifyProductId: null,
          active: false,
          visible: false,
        }),
      }),
    );
    expect(tx.productVariant.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          productId_providerVariantId: {
            productId: 'local-product-1',
            providerVariantId: 'MZ-VARIANT-1',
          },
        },
        create: expect.objectContaining({
          providerVariantId: 'MZ-VARIANT-1',
          printifyVariantId: null,
          isEnabled: false,
          inStock: false,
        }),
        update: expect.objectContaining({
          printifyVariantId: null,
          isEnabled: false,
          inStock: false,
        }),
      }),
    );
    expect(tx.productImage.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          variantIds: [],
          isDefault: true,
        }),
      }),
    );
    expect(service.createProduct).not.toHaveBeenCalled();
    expect(service.updateProduct).not.toHaveBeenCalled();
    expect(service.deleteProduct).not.toHaveBeenCalled();
    expect(JSON.stringify(json)).not.toContain('raw');
  });

  it('updates existing merchize integration references', async () => {
    vi.mocked(db.product.findMany).mockResolvedValue([
      { id: 'local-product-1', integrationRef: 'merchize:mz-product-1' },
    ] as never);

    const { response, json } = await callPOST(await applyRoute());

    expect(response.status).toBe(200);
    expect(json.data.inserted).toBe(0);
    expect(json.data.updated).toBe(1);
    expect(json.data.products[0].action).toBe('updated');
  });
});
