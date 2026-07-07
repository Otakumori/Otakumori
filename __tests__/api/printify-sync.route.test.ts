import { auth } from '@clerk/nextjs/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/app/lib/db';
import { getPrintifyService } from '@/app/lib/printify/service';
import { syncPrintifyProducts } from '@/lib/catalog/printifySync';
import { callGET, callPOST } from '@/tests/helpers/route';

const upstashMocks = vi.hoisted(() => {
  const redisClient = {
    set: vi.fn(),
    eval: vi.fn(),
  };
  const rateLimitCalls: Array<{ key: string; prefix: string }> = [];
  const rateLimitQueue: Array<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  }> = [];
  const rateLimitInstances: Array<{ prefix: string; limit: ReturnType<typeof vi.fn> }> = [];
  const Redis = vi.fn(() => redisClient);
  const Ratelimit = vi.fn((config: { prefix: string }) => {
    const instance = {
      prefix: config.prefix,
      limit: vi.fn(async (key: string) => {
        rateLimitCalls.push({ key, prefix: config.prefix });
        return (
          rateLimitQueue.shift() ?? {
            success: true,
            limit: 20,
            remaining: 19,
            reset: Date.now() + 60_000,
          }
        );
      }),
    };
    rateLimitInstances.push(instance);
    return instance;
  }) as unknown as ReturnType<typeof vi.fn> & {
    slidingWindow: ReturnType<typeof vi.fn>;
  };

  Ratelimit.slidingWindow = vi.fn((limit: number, window: string) => ({ limit, window }));

  return {
    redisClient,
    Redis,
    Ratelimit,
    rateLimitCalls,
    rateLimitQueue,
    rateLimitInstances,
  };
});

vi.mock('@upstash/redis', () => ({
  Redis: upstashMocks.Redis,
}));

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: upstashMocks.Ratelimit,
}));

vi.mock('@/app/lib/db', () => ({
  db: {
    product: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/env/server', () => ({
  env: {
    INTERNAL_AUTH_TOKEN: 'test-internal-token',
    UPSTASH_REDIS_REST_URL: 'https://redis.example',
    UPSTASH_REDIS_REST_TOKEN: 'test-redis-token',
    PRINTIFY_SHOP_ID: 'test-shop',
  },
}));

vi.mock('@/app/lib/printify/service', () => ({
  getPrintifyService: vi.fn(),
}));

vi.mock('@/lib/catalog/printifySync', () => ({
  syncPrintifyProducts: vi.fn(),
}));

const product = {
  id: 'printify-product-1',
  title: 'Sakura Starter Tee',
  description: 'A test-safe product.',
  tags: ['shirt'],
  options: [],
  variants: [
    {
      id: 101,
      price: 2500,
      title: 'Small',
      grams: 180,
      is_enabled: true,
      is_default: true,
      is_available: true,
      is_printify_express_eligible: false,
      options: [],
    },
  ],
  images: [
    {
      src: 'https://images.example/sakura.webp',
      variant_ids: [101],
      position: 'front',
      is_default: true,
    },
  ],
  visible: true,
  blueprint_id: 1,
  print_provider_id: 2,
  user_id: 3,
  shop_id: 4,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
  is_locked: false,
  is_printify_express_eligible: false,
  is_economy_shipping_eligible: false,
  is_economy_shipping_enabled: false,
};

function productWithVariants(
  id: string,
  variantIds: number[],
  overrides: Partial<typeof product> = {},
) {
  return {
    ...product,
    id,
    title: `Product ${id}`,
    variants: variantIds.map((variantId, index) => ({
      ...product.variants[0],
      id: variantId,
      title: `Variant ${variantId}-${index}`,
      sku: `${id}-${variantId}-${index}`,
      is_default: index === 0,
    })),
    images: [
      {
        ...product.images[0],
        src: `https://images.example/${id}.webp`,
        variant_ids: variantIds,
      },
    ],
    ...overrides,
  };
}

type PrintifyServiceMock = {
  getProducts: ReturnType<typeof vi.fn>;
  getAllProducts: ReturnType<typeof vi.fn>;
  createProduct: ReturnType<typeof vi.fn>;
  updateProduct: ReturnType<typeof vi.fn>;
  deleteProduct: ReturnType<typeof vi.fn>;
  publishProduct: ReturnType<typeof vi.fn>;
  createOrder: ReturnType<typeof vi.fn>;
};

async function route() {
  return import('../../app/api/v1/printify/sync/route');
}

function internalHeaders() {
  return {
    Authorization: 'Bearer test-internal-token',
    'x-request-id': `test-${crypto.randomUUID()}`,
  };
}

function page(data = [product], overrides: Record<string, unknown> = {}) {
  return {
    data,
    total: data.length,
    last_page: 1,
    current_page: 1,
    per_page: 50,
    from: data.length ? 1 : 0,
    to: data.length,
    ...overrides,
  };
}

function createServiceMock(): PrintifyServiceMock {
  return {
    getProducts: vi.fn().mockResolvedValue(page()),
    getAllProducts: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    publishProduct: vi.fn(),
    createOrder: vi.fn(),
  };
}

async function callRawPOST(body: string, headers = internalHeaders()) {
  const mod = await route();
  const handler = mod.POST as (request: Request) => Promise<Response>;
  const res = await handler(
    new Request('http://localhost/test', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body,
    }),
  );
  return { res, json: await res.json() };
}

describe('Printify protected catalog sync API', () => {
  let service: PrintifyServiceMock;

  beforeEach(() => {
    vi.clearAllMocks();
    upstashMocks.rateLimitCalls.length = 0;
    upstashMocks.rateLimitQueue.length = 0;

    vi.mocked(auth).mockReturnValue({ userId: null } as any);
    service = createServiceMock();
    vi.mocked(getPrintifyService).mockReturnValue(service as any);
    vi.mocked(db.product.findMany).mockResolvedValue([]);
    vi.mocked(syncPrintifyProducts).mockResolvedValue({
      count: 1,
      upserted: 1,
      hidden: 0,
      errors: [],
      lastSync: '2026-01-01T00:00:00.000Z',
    });
    upstashMocks.redisClient.set.mockResolvedValue('OK');
    upstashMocks.redisClient.eval.mockResolvedValue(1);
  });

  it('rejects unauthenticated sync requests', async () => {
    const { res, json } = await callPOST(await route(), { operation: 'preflight' });

    expect(res.status).toBe(401);
    expect(json.ok).toBe(false);
    expect(vi.mocked(getPrintifyService)).not.toHaveBeenCalled();
    expect(vi.mocked(syncPrintifyProducts)).not.toHaveBeenCalled();
  });

  it('rejects invalid internal tokens with 403', async () => {
    const { res, json } = await callPOST(
      await route(),
      { operation: 'preflight' },
      { headers: { Authorization: 'Bearer wrong-token' } },
    );

    expect(res.status).toBe(403);
    expect(json.ok).toBe(false);
    expect(vi.mocked(getPrintifyService)).not.toHaveBeenCalled();
  });

  it('rejects authenticated non-admin users', async () => {
    vi.mocked(auth).mockReturnValue({
      userId: 'user_123',
      sessionClaims: { public_metadata: { role: 'user' } },
    } as any);

    const { res, json } = await callPOST(await route(), { operation: 'preflight' });

    expect(res.status).toBe(403);
    expect(json.ok).toBe(false);
    expect(vi.mocked(getPrintifyService)).not.toHaveBeenCalled();
    expect(vi.mocked(syncPrintifyProducts)).not.toHaveBeenCalled();
  });

  it('allows a Clerk admin to run a read-only preflight', async () => {
    vi.mocked(auth).mockReturnValue({
      userId: 'admin_123',
      sessionClaims: { public_metadata: { role: 'admin' } },
    } as any);

    const { res, json } = await callGET(await route());

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.preflight.productCount).toBe(1);
    expect(json.data.preflight.wouldInsert).toBe(1);
    expect(vi.mocked(db.product.findMany)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(syncPrintifyProducts)).not.toHaveBeenCalled();
    expect(upstashMocks.rateLimitCalls.at(-1)?.key).toBe('preflight:admin:admin_123');
  });

  it('allows the internal token to run preflight without DB writes', async () => {
    const { res, json } = await callPOST(
      await route(),
      { operation: 'preflight' },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.preflight.variantCount).toBe(1);
    expect(json.data.preflight.rawVariantCount).toBe(1);
    expect(json.data.preflight.selectedVariantCount).toBe(1);
    expect(json.data.preflight.selectedInStockVariantCount).toBe(1);
    expect(json.data.preflight.selectedOutOfStockVariantCount).toBe(0);
    expect(json.data.preflight.enabledInStockVariantCount).toBe(1);
    expect(json.data.preflight.rawImageCount).toBe(1);
    expect(json.data.preflight.selectedUsableImageCount).toBe(1);
    expect(vi.mocked(syncPrintifyProducts)).not.toHaveBeenCalled();
    expect(service.getProducts).toHaveBeenCalledWith(1, 50);
    expect(service.createProduct).not.toHaveBeenCalled();
    expect(service.updateProduct).not.toHaveBeenCalled();
    expect(service.deleteProduct).not.toHaveBeenCalled();
    expect(service.publishProduct).not.toHaveBeenCalled();
    expect(service.createOrder).not.toHaveBeenCalled();
    expect(service.getAllProducts).not.toHaveBeenCalled();
  });

  it('returns sanitized 400 for malformed JSON', async () => {
    const { res, json } = await callRawPOST('{bad-json');

    expect(res.status).toBe(400);
    expect(json.error).toBe('Invalid JSON request body.');
    expect(vi.mocked(getPrintifyService)).not.toHaveBeenCalled();
  });

  it('requires explicit apply=true before mutating catalog records', async () => {
    const { res, json } = await callPOST(
      await route(),
      { operation: 'apply' },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/apply=true/i);
    expect(vi.mocked(syncPrintifyProducts)).not.toHaveBeenCalled();
    expect(upstashMocks.redisClient.set).not.toHaveBeenCalled();
  });

  it('rejects hideMissing on the controlled initial import path', async () => {
    const { res, json } = await callPOST(
      await route(),
      { operation: 'apply', apply: true, hideMissing: true },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/hideMissing/i);
    expect(vi.mocked(syncPrintifyProducts)).not.toHaveBeenCalled();
    expect(upstashMocks.redisClient.set).not.toHaveBeenCalled();
  });

  it('rejects invalid operations before provider calls', async () => {
    const { res, json } = await callPOST(
      await route(),
      { operation: 'delete-everything' },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/invalid/i);
    expect(vi.mocked(getPrintifyService)).not.toHaveBeenCalled();
  });

  it('sanitizes provider authentication failures', async () => {
    service.getProducts.mockRejectedValue(
      new Error('Printify API error (401): secret token should not leak'),
    );

    const { res, json } = await callPOST(
      await route(),
      { operation: 'preflight' },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(502);
    expect(JSON.stringify(json)).not.toMatch(/secret token/i);
    expect(json.error).toBe('Catalog sync failed. Check sanitized server logs for the request ID.');
    expect(vi.mocked(syncPrintifyProducts)).not.toHaveBeenCalled();
  });

  it('sanitizes provider timeouts', async () => {
    const timeout = new Error('request timed out with bearer token');
    timeout.name = 'AbortError';
    service.getProducts.mockRejectedValue(timeout);

    const { res, json } = await callPOST(
      await route(),
      { operation: 'preflight' },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(502);
    expect(json.error).toBe('Provider request timed out.');
    expect(JSON.stringify(json)).not.toMatch(/bearer token/i);
  });

  it('blocks apply when provider pagination is incomplete', async () => {
    service.getProducts
      .mockResolvedValueOnce(page([product], { total: 2, last_page: 2, to: 1 }))
      .mockResolvedValueOnce(page([], { total: 2, last_page: 2, current_page: 2, from: 0, to: 0 }));

    const { res, json } = await callPOST(
      await route(),
      { operation: 'apply', apply: true },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(500);
    expect(json.error).toBe('Catalog sync failed. Check sanitized server logs for the request ID.');
    expect(vi.mocked(syncPrintifyProducts)).not.toHaveBeenCalled();
  });

  it('blocks apply when the provider catalog is empty', async () => {
    service.getProducts.mockResolvedValue(page([], { total: 0, from: 0, to: 0 }));

    const { res, json } = await callPOST(
      await route(),
      { operation: 'apply', apply: true },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(422);
    expect(json.data.preflight.productCount).toBe(0);
    expect(json.data.preflight.safeToApply).toBe(false);
    expect(vi.mocked(syncPrintifyProducts)).not.toHaveBeenCalled();
  });

  it('blocks apply for invalid prices', async () => {
    service.getProducts.mockResolvedValue(
      page([{ ...product, variants: [{ ...product.variants[0], price: 0 }] }]),
    );

    const { res, json } = await callPOST(
      await route(),
      { operation: 'apply', apply: true },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(422);
    expect(json.data.preflight.productsMissingValidPrices).toBe(1);
    expect(vi.mocked(syncPrintifyProducts)).not.toHaveBeenCalled();
  });

  it('blocks apply for missing images', async () => {
    service.getProducts.mockResolvedValue(page([{ ...product, images: [] }]));

    const { res, json } = await callPOST(
      await route(),
      { operation: 'apply', apply: true },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(422);
    expect(json.data.preflight.productsMissingUsableImages).toBe(1);
    expect(vi.mocked(syncPrintifyProducts)).not.toHaveBeenCalled();
  });

  it('blocks apply for products without selected variants', async () => {
    service.getProducts.mockResolvedValue(
      page([
        {
          ...product,
          variants: [{ ...product.variants[0], is_enabled: false, is_available: false }],
        },
      ]),
    );

    const { res, json } = await callPOST(
      await route(),
      { operation: 'apply', apply: true },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(422);
    expect(json.data.preflight.productsMissingSelectedVariants).toBe(1);
    expect(json.data.preflight.productsMissingEnabledVariants).toBe(1);
    expect(vi.mocked(syncPrintifyProducts)).not.toHaveBeenCalled();
  });

  it('allows a selected but out-of-stock variant during preflight', async () => {
    service.getProducts.mockResolvedValue(
      page([
        {
          ...product,
          variants: [
            {
              ...product.variants[0],
              is_enabled: true,
              is_available: false,
            },
          ],
        },
      ]),
    );

    const { res, json } = await callPOST(
      await route(),
      { operation: 'preflight' },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(200);
    expect(json.data.preflight.selectedVariantCount).toBe(1);
    expect(json.data.preflight.selectedInStockVariantCount).toBe(0);
    expect(json.data.preflight.selectedOutOfStockVariantCount).toBe(1);
    expect(json.data.preflight.productsMissingSelectedVariants).toBe(0);
    expect(json.data.preflight.safeToApply).toBe(true);
    expect(vi.mocked(syncPrintifyProducts)).not.toHaveBeenCalled();
  });

  it('blocks apply for duplicate product IDs', async () => {
    service.getProducts.mockResolvedValue(page([product, { ...product }], { total: 2, to: 2 }));

    const { res, json } = await callPOST(
      await route(),
      { operation: 'apply', apply: true },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(422);
    expect(json.data.preflight.duplicatePrintifyProductIdCount).toBe(1);
    expect(vi.mocked(syncPrintifyProducts)).not.toHaveBeenCalled();
  });

  it('allows repeated raw variant IDs across different products during preflight', async () => {
    service.getProducts.mockResolvedValue(
      page(
        [
          productWithVariants('printify-product-a', [101]),
          productWithVariants('printify-product-b', [101]),
        ],
        { total: 2, to: 2 },
      ),
    );

    const { res, json } = await callPOST(
      await route(),
      { operation: 'preflight' },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(200);
    expect(json.data.preflight.duplicatePrintifyProductIdCount).toBe(0);
    expect(json.data.preflight.duplicateVariantIdCount).toBe(0);
    expect(json.data.preflight.safeToApply).toBe(true);
    expect(json.data.preflight.issues).not.toContainEqual(
      expect.objectContaining({ reason: 'duplicate_printify_variant_ids' }),
    );
    expect(vi.mocked(syncPrintifyProducts)).not.toHaveBeenCalled();
  });

  it('blocks apply for duplicate variant IDs within the same product', async () => {
    service.getProducts.mockResolvedValue(
      page([productWithVariants('printify-product-a', [101, 101])]),
    );

    const { res, json } = await callPOST(
      await route(),
      { operation: 'apply', apply: true },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(422);
    expect(json.data.preflight.duplicateVariantIdCount).toBe(1);
    expect(json.data.preflight.safeToApply).toBe(false);
    expect(json.data.preflight.issues).toContainEqual(
      expect.objectContaining({ productId: 'catalog', reason: 'duplicate_printify_variant_ids' }),
    );
    expect(vi.mocked(syncPrintifyProducts)).not.toHaveBeenCalled();
  });

  it('counts distinct duplicated product-scoped variant keys', async () => {
    service.getProducts.mockResolvedValue(
      page(
        [
          productWithVariants('printify-product-a', [101, 101, 101]),
          productWithVariants('printify-product-b', [202, 202]),
        ],
        { total: 2, to: 2 },
      ),
    );

    const { res, json } = await callPOST(
      await route(),
      { operation: 'preflight' },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(200);
    expect(json.data.preflight.duplicateVariantIdCount).toBe(2);
    expect(json.data.preflight.safeToApply).toBe(false);
    expect(json.data.preflight.issues).toContainEqual(
      expect.objectContaining({ productId: 'catalog', reason: 'duplicate_printify_variant_ids' }),
    );
  });

  it('keeps duplicate product IDs unsafe after product-scoped variant validation', async () => {
    service.getProducts.mockResolvedValue(
      page(
        [
          productWithVariants('printify-product-a', [101]),
          productWithVariants('printify-product-a', [202]),
        ],
        { total: 2, to: 2 },
      ),
    );

    const { res, json } = await callPOST(
      await route(),
      { operation: 'preflight' },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(200);
    expect(json.data.preflight.duplicatePrintifyProductIdCount).toBe(1);
    expect(json.data.preflight.duplicateVariantIdCount).toBe(0);
    expect(json.data.preflight.safeToApply).toBe(false);
    expect(json.data.preflight.issues).toContainEqual(
      expect.objectContaining({ productId: 'catalog', reason: 'duplicate_printify_product_ids' }),
    );
  });

  it('treats production-shaped cross-product variant overlap as safe', async () => {
    const productionShapedProducts = Array.from({ length: 16 }, (_, index) => {
      const productIndex = index + 1;
      const selected = productWithVariants(`printify-product-${productIndex}`, [101, 202, 303]);
      return {
        ...selected,
        variants: [
          ...selected.variants,
          {
            ...product.variants[0],
            id: 404,
            is_enabled: false,
            is_available: false,
          },
        ],
      };
    });
    service.getProducts.mockResolvedValue(
      page(productionShapedProducts, { total: productionShapedProducts.length, to: 16 }),
    );

    const { res, json } = await callPOST(
      await route(),
      { operation: 'preflight' },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(200);
    expect(json.data.preflight.productCount).toBe(16);
    expect(json.data.preflight.variantCount).toBe(64);
    expect(json.data.preflight.rawVariantCount).toBe(64);
    expect(json.data.preflight.selectedVariantCount).toBe(48);
    expect(json.data.preflight.duplicateVariantIdCount).toBe(0);
    expect(json.data.preflight.invalidProductCount).toBe(0);
    expect(json.data.preflight.safeToApply).toBe(true);
  });

  it('ignores duplicate raw variant IDs when all duplicates are disabled', async () => {
    service.getProducts.mockResolvedValue(
      page([
        {
          ...productWithVariants('printify-product-a', [101]),
          variants: [
            { ...product.variants[0], id: 101, is_enabled: true, is_available: true },
            { ...product.variants[0], id: 202, is_enabled: false, is_available: false },
            { ...product.variants[0], id: 202, is_enabled: false, is_available: false },
          ],
        },
      ]),
    );

    const { res, json } = await callPOST(
      await route(),
      { operation: 'preflight' },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(200);
    expect(json.data.preflight.rawVariantCount).toBe(3);
    expect(json.data.preflight.selectedVariantCount).toBe(1);
    expect(json.data.preflight.duplicateVariantIdCount).toBe(0);
    expect(json.data.preflight.safeToApply).toBe(true);
    expect(json.data.preflight.issues).not.toContainEqual(
      expect.objectContaining({ reason: 'duplicate_printify_variant_ids' }),
    );
  });

  it('reports fifteen existing products plus one missing product as updates and one insert', async () => {
    const existingProducts = Array.from({ length: 15 }, (_, index) =>
      productWithVariants(`printify-product-${index + 1}`, [101, 202, 303]),
    );
    const missingProduct = productWithVariants('minimal-cleavage-code-tee', [101, 202, 303]);
    vi.mocked(db.product.findMany).mockResolvedValue(
      existingProducts.map((existingProduct) => ({
        printifyProductId: existingProduct.id,
      })) as never,
    );
    service.getProducts.mockResolvedValue(
      page([...existingProducts, missingProduct], { total: 16, to: 16 }),
    );

    const { res, json } = await callPOST(
      await route(),
      { operation: 'preflight' },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(200);
    expect(json.data.preflight.productCount).toBe(16);
    expect(json.data.preflight.existingPrintifyProductCount).toBe(15);
    expect(json.data.preflight.wouldUpdate).toBe(15);
    expect(json.data.preflight.wouldInsert).toBe(1);
    expect(json.data.preflight.wouldHide).toBe(0);
    expect(json.data.preflight.wouldSkip).toBe(0);
    expect(json.data.preflight.safeToApply).toBe(true);
    expect(vi.mocked(syncPrintifyProducts)).not.toHaveBeenCalled();
  });

  it('blocks apply for true product-scoped duplicate variant IDs', async () => {
    service.getProducts.mockResolvedValue(
      page([productWithVariants('printify-product-a', [101, 101])]),
    );

    const { res, json } = await callPOST(
      await route(),
      { operation: 'apply', apply: true },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(422);
    expect(json.data.preflight.duplicateVariantIdCount).toBe(1);
    expect(vi.mocked(syncPrintifyProducts)).not.toHaveBeenCalled();
  });

  it('enforces distributed preflight rate limits', async () => {
    upstashMocks.rateLimitQueue.push({
      success: false,
      limit: 20,
      remaining: 0,
      reset: Date.now() + 120_000,
    });

    const { res, json } = await callPOST(
      await route(),
      { operation: 'preflight' },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(429);
    expect(json.error).toMatch(/rate limit/i);
    expect(service.getProducts).not.toHaveBeenCalled();
    expect(upstashMocks.rateLimitCalls.at(-1)?.prefix).toContain('preflight-rate');
  });

  it('enforces distributed apply rate limits', async () => {
    upstashMocks.rateLimitQueue.push({
      success: false,
      limit: 1,
      remaining: 0,
      reset: Date.now() + 600_000,
    });

    const { res, json } = await callPOST(
      await route(),
      { operation: 'apply', apply: true },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(429);
    expect(json.error).toMatch(/rate limit/i);
    expect(upstashMocks.rateLimitCalls.at(-1)?.prefix).toContain('apply-rate');
    expect(upstashMocks.redisClient.set).not.toHaveBeenCalled();
  });

  it('fails closed when Redis rate limiting is unavailable', async () => {
    const preflightLimiter = upstashMocks.rateLimitInstances[0];
    preflightLimiter.limit.mockRejectedValueOnce(new Error('redis down'));

    const { res, json } = await callPOST(
      await route(),
      { operation: 'preflight' },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(503);
    expect(json.error).toMatch(/rate limit unavailable/i);
    expect(service.getProducts).not.toHaveBeenCalled();
  });

  it('acquires a distributed lock before apply', async () => {
    const { res, json } = await callPOST(
      await route(),
      { operation: 'apply', apply: true },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(upstashMocks.redisClient.set).toHaveBeenCalledWith(
      'otakumori:catalog-sync:apply-lock',
      expect.any(String),
      { nx: true, ex: 600 },
    );
    expect(upstashMocks.redisClient.eval).toHaveBeenCalledWith(
      expect.stringContaining('redis.call("GET"'),
      ['otakumori:catalog-sync:apply-lock'],
      [expect.any(String)],
    );
    expect(vi.mocked(syncPrintifyProducts)).toHaveBeenCalledWith([product], {
      hideMissing: false,
      requestId: expect.any(String),
    });
  });

  it('returns 409 for concurrent apply attempts across instances', async () => {
    upstashMocks.redisClient.set.mockResolvedValueOnce(null);

    const { res, json } = await callPOST(
      await route(),
      { operation: 'apply', apply: true },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(409);
    expect(json.error).toMatch(/already running/i);
    expect(vi.mocked(syncPrintifyProducts)).not.toHaveBeenCalled();
  });

  it('fails closed when Redis lock acquisition is unavailable', async () => {
    upstashMocks.redisClient.set.mockRejectedValueOnce(new Error('redis unavailable'));

    const { res, json } = await callPOST(
      await route(),
      { operation: 'apply', apply: true },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(503);
    expect(json.error).toMatch(/lock unavailable/i);
    expect(vi.mocked(syncPrintifyProducts)).not.toHaveBeenCalled();
  });

  it('releases only the lock owner after controlled failure', async () => {
    vi.mocked(syncPrintifyProducts).mockRejectedValueOnce(new Error('db failed with secret text'));

    const { res, json } = await callPOST(
      await route(),
      { operation: 'apply', apply: true },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(500);
    expect(JSON.stringify(json)).not.toMatch(/secret text/i);
    expect(upstashMocks.redisClient.eval).toHaveBeenCalledWith(
      expect.stringContaining('ARGV[1]'),
      ['otakumori:catalog-sync:apply-lock'],
      [expect.any(String)],
    );
  });

  it('continues after an expired distributed lock permits a later apply', async () => {
    upstashMocks.redisClient.set.mockResolvedValueOnce(null).mockResolvedValueOnce('OK');

    const first = await callPOST(
      await route(),
      { operation: 'apply', apply: true },
      { headers: internalHeaders() },
    );
    const second = await callPOST(
      await route(),
      { operation: 'apply', apply: true },
      { headers: internalHeaders() },
    );

    expect(first.res.status).toBe(409);
    expect(second.res.status).toBe(200);
    expect(vi.mocked(syncPrintifyProducts)).toHaveBeenCalledTimes(1);
  });

  it('can be applied repeatedly without hiding unrelated records', async () => {
    await callPOST(
      await route(),
      { operation: 'apply', apply: true },
      { headers: internalHeaders() },
    );
    await callPOST(
      await route(),
      { operation: 'apply', apply: true },
      { headers: internalHeaders() },
    );

    expect(vi.mocked(syncPrintifyProducts)).toHaveBeenCalledTimes(2);
    expect(vi.mocked(syncPrintifyProducts)).toHaveBeenNthCalledWith(1, [product], {
      hideMissing: false,
      requestId: expect.any(String),
    });
    expect(vi.mocked(syncPrintifyProducts)).toHaveBeenNthCalledWith(2, [product], {
      hideMissing: false,
      requestId: expect.any(String),
    });
  });

  it('returns 207 for partial per-product failures without false success', async () => {
    vi.mocked(syncPrintifyProducts).mockResolvedValueOnce({
      count: 2,
      upserted: 1,
      hidden: 0,
      errors: ['Product failed with hidden provider details'],
      lastSync: '2026-01-01T00:00:00.000Z',
    });

    const { res, json } = await callPOST(
      await route(),
      { operation: 'apply', apply: true },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(207);
    expect(json.ok).toBe(false);
    expect(json.data.result.errorCount).toBe(1);
    expect(JSON.stringify(json)).not.toMatch(/hidden provider details/i);
  });

  it('does not call Printify provider-side write or order methods', async () => {
    await callPOST(
      await route(),
      { operation: 'apply', apply: true },
      { headers: internalHeaders() },
    );

    expect(service.createProduct).not.toHaveBeenCalled();
    expect(service.updateProduct).not.toHaveBeenCalled();
    expect(service.deleteProduct).not.toHaveBeenCalled();
    expect(service.publishProduct).not.toHaveBeenCalled();
    expect(service.createOrder).not.toHaveBeenCalled();
  });
});
