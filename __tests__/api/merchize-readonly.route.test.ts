import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getMerchizeService } from '@/app/lib/merchize/service';
import { db } from '@/app/lib/db';
import { limitApi } from '@/lib/ratelimit';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

vi.mock('@/env.mjs', () => ({
  env: {
    NODE_ENV: 'test',
    MERCHIZE_API_URL: 'https://merchize.example',
    MERCHIZE_STORE_API_URL: '',
    MERCHIZE_ACCESS_TOKEN: 'test-token',
    MERCHIZE_API_TOKEN: '',
    MERCHIZE_WEBHOOK_SECRET: 'test-webhook-secret',
    UPSTASH_REDIS_REST_URL: '',
    UPSTASH_REDIS_REST_TOKEN: '',
  },
}));

vi.mock('@/app/lib/merchize/service', () => ({
  getMerchizeService: vi.fn(),
}));

vi.mock('@/app/lib/db', () => ({
  db: {
    product: {
      findUnique: vi.fn(),
    },
    order: {
      update: vi.fn(),
    },
    printifyOrderSync: {
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
  },
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

function serviceMock(overrides: Record<string, unknown> = {}) {
  return {
    preflightCatalog: vi.fn().mockResolvedValue(preflightSummary()),
    getProducts: vi.fn().mockResolvedValue([
      {
        provider: 'merchize',
        providerProductId: 'merchize_1',
        id: 'merchize_1',
        title: 'Merchize Tee',
        sku: 'MT-1',
        status: 'active',
        price: 25,
        priceRange: { min: 25, max: 29, currency: 'USD' },
        images: [{ url: 'https://cdn.example/merchize-tee.png' }],
        variants: [
          {
            provider: 'merchize',
            providerVariantId: 'MZ-VARIANT-1',
            sku: 'MT-1-S',
            title: 'Small',
            options: [{ option: 'Size', value: 'S' }],
            price: 25,
            currency: 'USD',
            inStock: true,
            availability: 'available',
            printifyVariantId: null,
          },
        ],
        imageCount: 1,
        variantCount: 2,
        pricedVariantCount: 2,
        warnings: [],
        importReadiness: { ready: true, issues: [] },
        raw: { should: 'not leak' },
      },
    ]),
    ...overrides,
  };
}

function preflightSummary() {
  return {
    connection: {
      success: true,
      endpoint: '/product/catalog',
      status: 200,
      productCount: 1,
      sampleKeys: ['data'],
    },
    productCount: 1,
    normalizedProductCount: 1,
    variantCount: 2,
    pricedVariantCount: 2,
    imageCount: 1,
    productsMissingImages: 0,
    productsMissingPrice: 0,
    duplicateProductIdCount: 0,
    duplicateSkuCount: 0,
    payloadShapeKeys: ['data'],
    safeToImport: true,
    issues: [],
    products: [
      {
        provider: 'merchize',
        providerProductId: 'merchize_1',
        id: 'merchize_1',
        title: 'Merchize Tee',
        sku: 'MT-1',
        status: 'active',
        price: 25,
        priceRange: { min: 25, max: 29, currency: 'USD' },
        images: [{ url: 'https://cdn.example/merchize-tee.png' }],
        variants: [
          {
            provider: 'merchize',
            providerVariantId: 'MZ-VARIANT-1',
            sku: 'MT-1-S',
            title: 'Small',
            options: [{ option: 'Size', value: 'S' }],
            price: 25,
            currency: 'USD',
            inStock: true,
            availability: 'available',
            printifyVariantId: null,
          },
        ],
        imageCount: 1,
        variantCount: 2,
        pricedVariantCount: 2,
        warnings: [],
        importReadiness: { ready: true, issues: [] },
      },
    ],
  };
}

async function adminPreflightRoute() {
  return import('../../app/api/admin/merchize/preflight/route');
}

async function merchizeProductsRoute() {
  return import('../../app/api/merchize/products/route');
}

async function debugRoute() {
  return import('../../app/api/debug/merchize/route');
}

async function webhookRoute() {
  return import('../../app/api/webhooks/merchize/route');
}

async function catalogProductRoute() {
  return import('../../app/api/v1/catalog-product/[id]/route');
}

async function callGET(mod: Record<string, unknown>, path = '/test') {
  const handler = mod.GET as (request: NextRequest, context?: unknown) => Promise<Response>;
  const response = await handler(new NextRequest(`http://localhost${path}`));
  return { response, json: await response.json() };
}

describe('Merchize read-only admin routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminSession();
    vi.mocked(limitApi).mockResolvedValue({
      success: true,
      limit: 20,
      remaining: 19,
      reset: Date.now() + 60_000,
    } as never);
    vi.mocked(getMerchizeService).mockReturnValue(serviceMock() as never);
  });

  it('requires authentication for Merchize preflight', async () => {
    noSession();

    const { response, json } = await callGET(await adminPreflightRoute());

    expect(response.status).toBe(401);
    expect(json.error).toBe('AUTH_REQUIRED');
  });

  it('requires admin role for Merchize preflight', async () => {
    nonAdminSession();

    const { response, json } = await callGET(await adminPreflightRoute());

    expect(response.status).toBe(403);
    expect(json.error).toBe('FORBIDDEN');
  });

  it('returns a sanitized read-only Merchize catalog summary', async () => {
    const service = serviceMock();
    vi.mocked(getMerchizeService).mockReturnValue(service as never);

    const { response, json } = await callGET(await adminPreflightRoute());

    expect(response.status).toBe(200);
    expect(json.data).toMatchObject({
      productCount: 1,
      normalizedProductCount: 1,
      variantCount: 2,
      imageCount: 1,
      safeToImport: true,
    });
    expect(json.data.products[0]).toMatchObject({
      provider: 'merchize',
      providerProductId: 'merchize_1',
      priceRange: { min: 25, max: 29, currency: 'USD' },
      importReadiness: { ready: true, issues: [] },
      variants: [
        expect.objectContaining({
          provider: 'merchize',
          providerVariantId: 'MZ-VARIANT-1',
          printifyVariantId: null,
        }),
      ],
    });
    expect(service.preflightCatalog).toHaveBeenCalledWith({ limit: 50, page: 1 });
    expect(JSON.stringify(json)).not.toContain('test-token');
    expect(JSON.stringify(json)).not.toContain('raw');
    expect(JSON.stringify(json)).not.toContain('printify_product_');
  });

  it('rate limits read-only Merchize preflight', async () => {
    vi.mocked(limitApi).mockResolvedValue({
      success: false,
      limit: 20,
      remaining: 0,
      reset: Date.now() + 30_000,
    } as never);

    const { response, json } = await callGET(await adminPreflightRoute());

    expect(response.status).toBe(429);
    expect(json.error.code).toBe('RATE_LIMITED');
    expect(getMerchizeService).not.toHaveBeenCalled();
  });

  it('sanitizes provider failures without leaking raw provider detail', async () => {
    vi.mocked(getMerchizeService).mockReturnValue(
      serviceMock({
        preflightCatalog: vi
          .fn()
          .mockRejectedValue(new Error('provider said token=test-token secret response')),
      }) as never,
    );

    const { response, json } = await callGET(await adminPreflightRoute());

    expect(response.status).toBe(502);
    expect(json.error.message).toBe(
      'Merchize preflight failed. Check provider configuration and logs with the request ID.',
    );
    expect(JSON.stringify(json)).not.toContain('test-token');
  });

  it('keeps the legacy Merchize products route admin-only and omits raw payloads', async () => {
    const { response, json } = await callGET(await merchizeProductsRoute());

    expect(response.status).toBe(200);
    expect(json.data.count).toBe(1);
    expect(json.data.products[0]).toMatchObject({
      provider: 'merchize',
      providerProductId: 'merchize_1',
      id: 'merchize_1',
      title: 'Merchize Tee',
      variantCount: 2,
      variants: [
        expect.objectContaining({
          provider: 'merchize',
          providerVariantId: 'MZ-VARIANT-1',
          printifyVariantId: null,
        }),
      ],
    });
    expect(json.data.products[0].raw).toBeUndefined();
  });

  it('keeps Merchize debug configuration behind admin auth and reports names only', async () => {
    const { response, json } = await callGET(await debugRoute());

    expect(response.status).toBe(200);
    expect(json.data.configured).toEqual(
      expect.objectContaining({
        MERCHIZE_API_URL: true,
        MERCHIZE_ACCESS_TOKEN: true,
        MERCHIZE_WEBHOOK_SECRET: true,
      }),
    );
    expect(JSON.stringify(json)).not.toContain('https://merchize.example');
    expect(JSON.stringify(json)).not.toContain('test-token');
  });
});

describe('Merchize webhook hardening', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects invalid Merchize webhook keys', async () => {
    const mod = await webhookRoute();
    const response = await mod.POST(
      new NextRequest('http://localhost/api/webhooks/merchize', {
        method: 'POST',
        headers: { 'merchize-webhook-key': 'wrong' },
        body: JSON.stringify({ type: 'order_changed_tracking' }),
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.ok).toBe(false);
  });

  it('rejects invalid JSON without swallowing the failure', async () => {
    const mod = await webhookRoute();
    const response = await mod.POST(
      new NextRequest('http://localhost/api/webhooks/merchize', {
        method: 'POST',
        headers: { 'merchize-webhook-key': 'test-webhook-secret' },
        body: '{',
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.ok).toBe(false);
  });

  it('accepts verified webhooks as no-op until provider-neutral order mapping exists', async () => {
    const mod = await webhookRoute();
    const response = await mod.POST(
      new NextRequest('http://localhost/api/webhooks/merchize', {
        method: 'POST',
        headers: { 'merchize-webhook-key': 'test-webhook-secret' },
        body: JSON.stringify({
          type: 'order_changed_tracking',
          data: { id: 'merchize-order-1', tracking_number: 'TRACK-1' },
        }),
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(202);
    expect(json.status).toBe('accepted_noop');
    expect(db.order.update).not.toHaveBeenCalled();
    expect(db.printifyOrderSync.create).not.toHaveBeenCalled();
    expect(db.printifyOrderSync.update).not.toHaveBeenCalled();
    expect(db.printifyOrderSync.upsert).not.toHaveBeenCalled();
  });
});

describe('public catalog safety for Merchize', () => {
  it('does not perform live public Merchize provider reads before local import', async () => {
    const mod = await catalogProductRoute();

    const response = await mod.GET(
      new NextRequest('http://localhost/api/v1/catalog-product/merchize:1'),
      {
        params: Promise.resolve({ id: 'merchize:1' }),
      },
    );
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error.code).toBe('NOT_FOUND');
    expect(getMerchizeService).not.toHaveBeenCalled();
  });
});
