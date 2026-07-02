import { auth } from '@clerk/nextjs/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { callGET, callPOST } from '@/tests/helpers/route';
import { db } from '@/app/lib/db';
import { getPrintifyService } from '@/app/lib/printify/service';
import { syncPrintifyProducts } from '@/lib/catalog/printifySync';

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

async function route() {
  return import('../../app/api/v1/printify/sync/route');
}

function internalHeaders() {
  return {
    Authorization: 'Bearer test-internal-token',
    'x-request-id': `test-${crypto.randomUUID()}`,
  };
}

describe('Printify protected catalog sync API', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(auth).mockReturnValue({ userId: null } as any);
    vi.mocked(getPrintifyService).mockReturnValue({
      getAllProducts: vi.fn().mockResolvedValue([product]),
    } as any);
    vi.mocked(db.product.findMany).mockResolvedValue([]);
    vi.mocked(syncPrintifyProducts).mockResolvedValue({
      count: 1,
      upserted: 1,
      hidden: 0,
      errors: [],
      lastSync: '2026-01-01T00:00:00.000Z',
    });
  });

  it('rejects unauthenticated sync requests', async () => {
    const { res, json } = await callPOST(await route(), { operation: 'preflight' });

    expect(res.status).toBe(401);
    expect(json.ok).toBe(false);
    expect(vi.mocked(getPrintifyService)).not.toHaveBeenCalled();
    expect(vi.mocked(syncPrintifyProducts)).not.toHaveBeenCalled();
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
    expect(json.data.preflight.enabledInStockVariantCount).toBe(1);
    expect(vi.mocked(syncPrintifyProducts)).not.toHaveBeenCalled();
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
  });

  it('applies catalog products with hideMissing=false', async () => {
    const { res, json } = await callPOST(
      await route(),
      { operation: 'apply', apply: true },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(vi.mocked(syncPrintifyProducts)).toHaveBeenCalledWith([product], { hideMissing: false });
    expect(json.data.result.upserted).toBe(1);
    expect(json.data.result.hidden).toBe(0);
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
    });
    expect(vi.mocked(syncPrintifyProducts)).toHaveBeenNthCalledWith(2, [product], {
      hideMissing: false,
    });
  });

  it('blocks a duplicate apply while a sync is in progress', async () => {
    let resolveSync: () => void = () => undefined;
    vi.mocked(syncPrintifyProducts).mockReturnValue(
      new Promise((resolve) => {
        resolveSync = () =>
          resolve({
            count: 1,
            upserted: 1,
            hidden: 0,
            errors: [],
            lastSync: '2026-01-01T00:00:00.000Z',
          });
      }),
    );

    const first = callPOST(
      await route(),
      { operation: 'apply', apply: true },
      { headers: internalHeaders() },
    );
    await new Promise((resolve) => setTimeout(resolve, 0));

    const second = await callPOST(
      await route(),
      { operation: 'apply', apply: true },
      { headers: internalHeaders() },
    );

    resolveSync();
    await first;

    expect(second.res.status).toBe(409);
    expect(second.json.error).toMatch(/already running/i);
  });

  it('reports invalid provider data without applying writes', async () => {
    vi.mocked(getPrintifyService).mockReturnValue({
      getAllProducts: vi.fn().mockResolvedValue([
        {
          ...product,
          images: [],
          variants: [{ ...product.variants[0], is_enabled: false, is_available: false }],
        },
      ]),
    } as any);

    const { res, json } = await callPOST(
      await route(),
      { operation: 'apply', apply: true },
      { headers: internalHeaders() },
    );

    expect(res.status).toBe(422);
    expect(json.ok).toBe(false);
    expect(json.data.preflight.safeToApply).toBe(false);
    expect(json.data.preflight.productsMissingUsableImages).toBe(1);
    expect(json.data.preflight.productsMissingEnabledVariants).toBe(1);
    expect(vi.mocked(syncPrintifyProducts)).not.toHaveBeenCalled();
  });
});
