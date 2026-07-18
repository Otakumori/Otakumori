import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/app/lib/db';
import { buildMerchizeImportPreflightForProducts } from '@/app/lib/merchize/importPreflight';
import { getMerchizeService } from '@/app/lib/merchize/service';
import { limitApi } from '@/lib/ratelimit';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

vi.mock('@/app/lib/db', () => ({
  db: {
    product: {
      findMany: vi.fn(),
    },
    productVariant: {
      findMany: vi.fn(),
    },
    productImage: {},
    providerImportOperation: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
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

vi.mock('@/env/server', () => ({
  env: {
    get AUTH_SECRET() {
      return process.env.AUTH_SECRET;
    },
    get CLERK_SECRET_KEY() {
      return process.env.CLERK_SECRET_KEY || 'vitest-clerk-secret';
    },
    get MERCHIZE_LOCAL_IMPORT_ENABLED() {
      return process.env.MERCHIZE_LOCAL_IMPORT_ENABLED;
    },
  },
}));

function adminSession() {
  vi.mocked(auth).mockResolvedValue({
    userId: 'admin_123',
    sessionClaims: { metadata: { role: 'admin' } },
  } as never);
}

function nonAdminSession() {
  vi.mocked(auth).mockResolvedValue({
    userId: 'user_123',
    sessionClaims: { metadata: { role: 'viewer' } },
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
    priceRange: { min: 25, max: 25, currency: 'USD' },
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

function auditRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'audit_1',
    requestId: 'req_1',
    adminUserId: 'admin_123',
    provider: 'merchize',
    action: 'hidden_local_import',
    status: 'pending',
    preflightFingerprint: 'fingerprint',
    fingerprintExpiresAt: new Date(Date.now() + 60_000),
    idempotencyKeyHash: 'hash',
    expectedProductCount: 1,
    expectedInsertCount: 1,
    expectedUpdateCount: 0,
    expectedSkipCount: 0,
    expectedBlockCount: 0,
    insertedCount: 0,
    updatedCount: 0,
    skippedCount: 0,
    blockedCount: 0,
    failureCategory: null,
    failureMessage: null,
    startedAt: new Date(),
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function transactionClient(overrides: Record<string, unknown> = {}) {
  return {
    product: {
      upsert: vi.fn().mockResolvedValue({ id: 'product_1' }),
    },
    productImage: {
      upsert: vi.fn().mockResolvedValue({}),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    productVariant: {
      upsert: vi.fn().mockResolvedValue({}),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    providerImportOperation: {
      update: vi.fn().mockResolvedValue({}),
    },
    ...overrides,
  };
}

async function applyRoute() {
  return import('../../app/api/admin/merchize/import/apply/route');
}

async function callPOST(body: Record<string, unknown>, headers: Record<string, string> = {}) {
  const mod = await applyRoute();
  const handler = mod.POST as (request: NextRequest) => Promise<Response>;
  const response = await handler(
    new NextRequest('http://localhost/api/admin/merchize/import/apply', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    }),
  );

  return { response, json: await response.json() };
}

async function signedPreflightBody(products = [merchizeProduct()]) {
  const preflight = await buildMerchizeImportPreflightForProducts(products as never, {
    now: new Date(),
  });

  return {
    confirmation: 'APPLY HIDDEN MERCHIZE IMPORT',
    preflightFingerprint: preflight.preflightFingerprint,
    fingerprintExpiresAt: preflight.fingerprintExpiresAt,
    preflightSignature: preflight.preflightSignature,
    expectedProductCount: preflight.productCount,
    expectedInsertCount: preflight.wouldInsert,
    expectedUpdateCount: preflight.wouldUpdate,
    expectedSkipCount: preflight.wouldSkip,
    expectedBlockCount: preflight.wouldBlock,
  };
}

describe('Merchize hidden local import apply route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AUTH_SECRET = 'vitest-merchize-import-signing-secret';
    process.env.MERCHIZE_LOCAL_IMPORT_ENABLED = 'true';
    adminSession();
    vi.mocked(limitApi).mockResolvedValue({
      success: true,
      limit: 20,
      remaining: 19,
      reset: Date.now() + 60_000,
    } as never);
    vi.mocked(db.product.findMany).mockResolvedValue([]);
    vi.mocked(db.productVariant.findMany).mockResolvedValue([]);
    vi.mocked(db.providerImportOperation.findUnique).mockResolvedValue(null);
    vi.mocked(db.providerImportOperation.create).mockResolvedValue(auditRecord() as never);
    vi.mocked(db.providerImportOperation.update).mockResolvedValue({} as never);
    vi.mocked(db.$transaction).mockImplementation(
      async (callback: (tx: unknown) => Promise<void>) => callback(transactionClient()),
    );
    vi.mocked(getMerchizeService).mockReturnValue(serviceMock() as never);
  });

  it('requires authentication and admin authorization', async () => {
    noSession();
    let result = await callPOST({});
    expect(result.response.status).toBe(401);
    expect(result.json.error).toBe('AUTH_REQUIRED');

    nonAdminSession();
    result = await callPOST({});
    expect(result.response.status).toBe(403);
    expect(result.json.error).toBe('FORBIDDEN');
  });

  it('fails closed when the hidden local import feature flag is disabled', async () => {
    process.env.MERCHIZE_LOCAL_IMPORT_ENABLED = '';

    const { response, json } = await callPOST({});

    expect(response.status).toBe(403);
    expect(json.error.code).toBe('FORBIDDEN');
    expect(getMerchizeService).not.toHaveBeenCalled();
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it('requires confirmation, signed preflight state, expected counts, and idempotency', async () => {
    const { response, json } = await callPOST({});

    expect(response.status).toBe(400);
    expect(json.error.code).toBe('VALIDATION_ERROR');
    expect(db.providerImportOperation.create).not.toHaveBeenCalled();
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it('inserts hidden, inactive, non-purchasable Merchize records with provider-neutral identities', async () => {
    const tx = transactionClient();
    vi.mocked(db.$transaction).mockImplementationOnce(
      async (callback: (transaction: typeof tx) => Promise<void>) => callback(tx),
    );
    const body = await signedPreflightBody();

    const { response, json } = await callPOST(body, { 'x-idempotency-key': 'secret-replay-key' });

    expect(response.status).toBe(200);
    expect(json.data).toMatchObject({
      ok: true,
      provider: 'merchize',
      mode: 'hidden_local_import',
      inserted: 1,
      updated: 0,
      public: false,
      purchasable: false,
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
            productId: 'product_1',
            providerVariantId: 'MZ-VARIANT-1',
          },
        },
        create: expect.objectContaining({
          providerVariantId: 'MZ-VARIANT-1',
          printifyVariantId: null,
          isEnabled: false,
        }),
        update: expect.objectContaining({
          printifyVariantId: null,
          isEnabled: false,
        }),
      }),
    );
    expect(db.providerImportOperation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          provider: 'merchize',
          action: 'hidden_local_import',
          status: 'pending',
          expectedProductCount: 1,
          expectedInsertCount: 1,
          idempotencyKeyHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        }),
      }),
    );
    expect(JSON.stringify(db.providerImportOperation.create.mock.calls)).not.toContain(
      'secret-replay-key',
    );
    expect(JSON.stringify(json)).not.toContain('raw');
    expect(JSON.stringify(json)).not.toContain('secret-replay-key');
  });

  it('blocks confirmation mismatch without catalog mutation', async () => {
    const body = await signedPreflightBody();

    const { response, json } = await callPOST(
      { ...body, confirmation: 'wrong confirmation' },
      { 'x-idempotency-key': 'blocked-key' },
    );

    expect(response.status).toBe(422);
    expect(json.data.status).toBe('blocked');
    expect(json.data.error).toBe('Merchize import apply confirmation did not match.');
    expect(db.$transaction).not.toHaveBeenCalled();
    expect(db.providerImportOperation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'blocked',
          failureCategory: 'confirmation_mismatch',
        }),
      }),
    );
  });

  it('rejects expired, unsigned, mismatched, and stale-count preflight requests', async () => {
    const body = await signedPreflightBody();

    for (const override of [
      { fingerprintExpiresAt: '2020-01-01T00:00:00.000Z' },
      { preflightSignature: 'bad-signature' },
      { preflightFingerprint: 'bad-fingerprint' },
      { expectedInsertCount: 2 },
    ]) {
      vi.clearAllMocks();
      adminSession();
      vi.mocked(limitApi).mockResolvedValue({
        success: true,
        limit: 20,
        remaining: 19,
        reset: Date.now() + 60_000,
      } as never);
      vi.mocked(db.product.findMany).mockResolvedValue([]);
      vi.mocked(db.productVariant.findMany).mockResolvedValue([]);
      vi.mocked(db.providerImportOperation.findUnique).mockResolvedValue(null);
      vi.mocked(db.providerImportOperation.create).mockResolvedValue(auditRecord() as never);
      vi.mocked(db.providerImportOperation.update).mockResolvedValue({} as never);
      vi.mocked(getMerchizeService).mockReturnValue(serviceMock() as never);

      const { response, json } = await callPOST(
        { ...body, ...override },
        { 'x-idempotency-key': `blocked-${Object.keys(override)[0]}` },
      );

      expect(response.status).toBe(422);
      expect(json.data.status).toBe('blocked');
      expect(db.$transaction).not.toHaveBeenCalled();
    }
  });

  it('does not mutate twice when the idempotency key is replayed', async () => {
    const existing = auditRecord({
      status: 'completed',
      insertedCount: 1,
      updatedCount: 0,
      skippedCount: 0,
      blockedCount: 0,
    });
    vi.mocked(db.providerImportOperation.findUnique).mockResolvedValue(existing as never);
    const body = await signedPreflightBody();

    const { response, json } = await callPOST(body, { 'x-idempotency-key': 'already-used' });

    expect(response.status).toBe(200);
    expect(json.data.replayed).toBe(true);
    expect(json.data.inserted).toBe(1);
    expect(getMerchizeService).not.toHaveBeenCalled();
    expect(db.providerImportOperation.create).not.toHaveBeenCalled();
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it('handles concurrent duplicate idempotency creation without catalog mutation', async () => {
    vi.mocked(db.providerImportOperation.findUnique)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(
        auditRecord({
          status: 'running',
          failureMessage: 'Existing import is still running.',
        }) as never,
      );
    vi.mocked(db.providerImportOperation.create).mockRejectedValueOnce({ code: 'P2002' });
    const body = await signedPreflightBody();

    const { response, json } = await callPOST(body, { 'x-idempotency-key': 'racing-key' });

    expect(response.status).toBe(409);
    expect(json.data.replayed).toBe(true);
    expect(json.data.status).toBe('blocked');
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it('marks sanitized failure and relies on transaction rollback if catalog writes fail', async () => {
    const tx = transactionClient({
      productVariant: {
        upsert: vi.fn().mockRejectedValue(new Error('raw token=secret stack trace')),
        updateMany: vi.fn(),
      },
    });
    vi.mocked(db.$transaction).mockImplementationOnce(
      async (callback: (transaction: typeof tx) => Promise<void>) => callback(tx),
    );
    const body = await signedPreflightBody();

    const { response, json } = await callPOST(body, { 'x-idempotency-key': 'rollback-key' });

    expect(response.status).toBe(500);
    expect(json.data.status).toBe('failed');
    expect(json.data.error).not.toContain('token=secret');
    expect(db.providerImportOperation.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'failed',
          failureCategory: 'apply_failed',
          failureMessage: 'Merchize import apply failed. Check sanitized logs with the request ID.',
        }),
      }),
    );
    expect(db.$transaction).toHaveBeenCalledTimes(1);
    expect((db as any).product.upsert).toBeUndefined();
  });
});
