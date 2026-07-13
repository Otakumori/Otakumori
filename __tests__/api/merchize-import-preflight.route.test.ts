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
      upsert: vi.fn(),
    },
    productVariant: {
      upsert: vi.fn(),
      updateMany: vi.fn(),
    },
    productImage: {
      upsert: vi.fn(),
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

async function preflightRoute() {
  return import('../../app/api/admin/merchize/import/preflight/route');
}

async function callGET(mod: Record<string, unknown>) {
  const handler = mod.GET as (request: NextRequest) => Promise<Response>;
  const response = await handler(
    new NextRequest('http://localhost/api/admin/merchize/import/preflight'),
  );
  return { response, json: await response.json() };
}

describe('Merchize hidden import preflight route', () => {
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
    vi.mocked(getMerchizeService).mockReturnValue(serviceMock() as never);
  });

  it('requires authentication', async () => {
    noSession();

    const { response, json } = await callGET(await preflightRoute());

    expect(response.status).toBe(401);
    expect(json.error).toBe('AUTH_REQUIRED');
  });

  it('requires admin authorization', async () => {
    nonAdminSession();

    const { response, json } = await callGET(await preflightRoute());

    expect(response.status).toBe(403);
    expect(json.error).toBe('FORBIDDEN');
  });

  it('returns dry-run counts for new Merchize products without DB writes', async () => {
    const service = serviceMock();
    vi.mocked(getMerchizeService).mockReturnValue(service as never);

    const { response, json } = await callGET(await preflightRoute());

    expect(response.status).toBe(200);
    expect(json.data).toMatchObject({
      provider: 'merchize',
      mode: 'hidden_local_import_preflight',
      productCount: 1,
      wouldInsert: 1,
      wouldUpdate: 0,
      wouldSkip: 0,
      wouldBlock: 0,
      safeToImport: true,
    });
    expect(json.data.products[0]).toMatchObject({
      provider: 'merchize',
      providerProductId: 'mz-product-1',
      integrationRef: 'merchize:mz-product-1',
      action: 'inserted',
      public: false,
      purchasable: false,
    });
    expect(service.getProducts).toHaveBeenCalledWith({ limit: 50, page: 1 });
    expect(db.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { integrationRef: { in: ['merchize:mz-product-1'] } },
      }),
    );
    expect(db.product.upsert).not.toHaveBeenCalled();
    expect(db.$transaction).not.toHaveBeenCalled();
    expect(JSON.stringify(json)).not.toContain('raw');
  });

  it('calculates wouldUpdate for existing merchize integration references', async () => {
    vi.mocked(db.product.findMany).mockResolvedValue([
      { id: 'product_1', integrationRef: 'merchize:mz-product-1' },
    ] as never);

    const { response, json } = await callGET(await preflightRoute());

    expect(response.status).toBe(200);
    expect(json.data.wouldInsert).toBe(0);
    expect(json.data.wouldUpdate).toBe(1);
    expect(json.data.products[0].action).toBe('updated');
  });

  it('blocks invalid products and duplicate provider identities', async () => {
    vi.mocked(getMerchizeService).mockReturnValue(
      serviceMock([
        merchizeProduct({ providerProductId: 'dup', id: 'dup' }),
        merchizeProduct({
          providerProductId: 'dup',
          id: 'dup',
          images: [],
          imageCount: 0,
          variants: [],
          variantCount: 0,
          pricedVariantCount: 0,
          warnings: ['product_missing_images', 'product_missing_variants', 'product_missing_price'],
          importReadiness: {
            ready: false,
            issues: ['product_missing_images', 'product_missing_variants', 'product_missing_price'],
          },
        }),
      ]) as never,
    );

    const { response, json } = await callGET(await preflightRoute());

    expect(response.status).toBe(200);
    expect(json.data.safeToImport).toBe(false);
    expect(json.data.wouldBlock).toBe(2);
    expect(JSON.stringify(json.data.issues)).toContain('duplicate_merchize_product_ids');
    expect(JSON.stringify(json.data.issues)).toContain('product_missing_images');
  });

  it('blocks duplicate provider variant IDs within a product', async () => {
    const duplicateVariant = {
      provider: 'merchize',
      providerVariantId: 'DUP-VARIANT',
      sku: 'DUP-1',
      title: 'Duplicate',
      options: [],
      price: 20,
      currency: 'USD',
      inStock: true,
      availability: 'available',
      printifyVariantId: null,
    };
    vi.mocked(getMerchizeService).mockReturnValue(
      serviceMock([
        merchizeProduct({
          variants: [duplicateVariant, { ...duplicateVariant, sku: 'DUP-2' }],
          variantCount: 2,
          pricedVariantCount: 2,
        }),
      ]) as never,
    );

    const { response, json } = await callGET(await preflightRoute());

    expect(response.status).toBe(200);
    expect(json.data.safeToImport).toBe(false);
    expect(JSON.stringify(json.data.issues)).toContain('duplicate_merchize_variant_ids');
  });

  it('sanitizes provider errors', async () => {
    vi.mocked(getMerchizeService).mockReturnValue(
      serviceMock([], {
        getProducts: vi.fn().mockRejectedValue(new Error('token=secret provider payload')),
      }) as never,
    );

    const { response, json } = await callGET(await preflightRoute());

    expect(response.status).toBe(502);
    expect(json.error.message).toBe(
      'Merchize import preflight failed. Check provider configuration and logs with the request ID.',
    );
    expect(JSON.stringify(json)).not.toContain('token=secret');
  });
});
