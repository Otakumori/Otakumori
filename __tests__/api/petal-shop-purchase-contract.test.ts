import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  canonicalRateLimit: vi.fn(),
  legacyRateLimit: vi.fn(),
  getCosmeticItem: vi.fn(),
  getContentRating: vi.fn(),
  getPolicyFromRequest: vi.fn(),
  canAccessNSFWContent: vi.fn(),
  spendPetalsAndFulfill: vi.fn(),
  userFindUnique: vi.fn(),
  canonicalInventoryFindFirst: vi.fn(),
  shopItemFindUnique: vi.fn(),
  legacyInventoryFindFirst: vi.fn(),
  ensureUserByClerkId: vi.fn(),
  logger: {
    request: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@clerk/nextjs/server', () => ({ auth: mocks.auth }));
vi.mock('@/app/lib/logger', () => ({ logger: mocks.logger }));
vi.mock('@/lib/requestId', () => ({ generateRequestId: () => 'request_test' }));
vi.mock('@/lib/log', () => ({ reqId: () => 'request_test' }));
vi.mock('@/app/lib/rate-limiting', () => ({
  getClientIdentifier: () => 'client_test',
  checkRateLimit: mocks.canonicalRateLimit,
}));
vi.mock('@/app/api/rate-limit', () => ({ rateLimit: mocks.legacyRateLimit }));
vi.mock('@/app/lib/cosmetics/cosmeticsConfig', () => ({
  getCosmeticItem: mocks.getCosmeticItem,
  getContentRating: mocks.getContentRating,
}));
vi.mock('@/app/lib/nsfw/user', () => ({
  canAccessNSFWContent: mocks.canAccessNSFWContent,
}));
vi.mock('@/app/lib/policy/fromRequest', () => ({
  getPolicyFromRequest: mocks.getPolicyFromRequest,
}));
vi.mock('@/app/lib/petals/spend', () => {
  class PetalSpendError extends Error {
    constructor(public readonly code: string) {
      super(code);
    }
  }

  return {
    PetalSpendError,
    spendPetalsAndFulfill: mocks.spendPetalsAndFulfill,
  };
});
vi.mock('@/lib/db', () => ({
  db: {
    user: { findUnique: mocks.userFindUnique },
    inventoryItem: {
      findFirst: mocks.canonicalInventoryFindFirst,
      findMany: vi.fn(),
    },
    couponGrant: { count: vi.fn() },
  },
}));
vi.mock('@/app/lib/prisma', () => ({
  prisma: {
    petalShopItem: { findUnique: mocks.shopItemFindUnique },
    inventoryItem: { findFirst: mocks.legacyInventoryFindFirst },
  },
}));
vi.mock('@/lib/petals-db', () => ({ ensureUserByClerkId: mocks.ensureUserByClerkId }));

import { POST as purchaseCanonicalCosmetic } from '@/app/api/v1/petals/shop/purchase/route';
import { POST as purchaseCatalogItem } from '@/app/api/petal-shop/purchase/route';
import { GET as getOwnedCosmetics } from '@/app/api/v1/cosmetics/route';
import { POST as equipCosmetic } from '@/app/api/v1/cosmetics/equip/route';
import { PetalSpendError } from '@/app/lib/petals/spend';

function request(path: string, body: unknown, idempotencyKey = 'idempotency_test') {
  return new NextRequest(`https://preview.example${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-idempotency-key': idempotencyKey,
    },
    body: JSON.stringify(body),
  });
}

describe('Petal Shop purchase contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ userId: 'clerk_test' });
    mocks.canonicalRateLimit.mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      resetTime: Date.now() + 60_000,
    });
    mocks.legacyRateLimit.mockResolvedValue({ limited: false });
    mocks.getContentRating.mockReturnValue('sfw');
    mocks.getPolicyFromRequest.mockReturnValue({ nsfwAllowed: false });
    mocks.getCosmeticItem.mockReturnValue({
      id: 'accessory-glasses-round',
      type: 'avatar-accessory',
      name: 'Round Glasses',
      costPetals: 350,
      rarity: 'common',
      contentRating: 'sfw',
    });
    mocks.userFindUnique.mockResolvedValue({
      id: 'user_test',
      petalBalance: 500,
      nsfwEnabled: false,
    });
    mocks.canonicalInventoryFindFirst.mockResolvedValue(null);
    mocks.shopItemFindUnique.mockResolvedValue({
      sku: 'catalog-test-cosmetic',
      name: 'Catalog Test Cosmetic',
      kind: 'COSMETIC',
      pricePetals: 25,
      metadata: null,
    });
    mocks.ensureUserByClerkId.mockResolvedValue({ id: 'user_test' });
    mocks.legacyInventoryFindFirst.mockResolvedValue(null);
  });

  it('does not disclose canonical purchase exception details', async () => {
    mocks.spendPetalsAndFulfill.mockRejectedValueOnce(
      new Error('postgresql://private-host/internal-table'),
    );

    const response = await purchaseCanonicalCosmetic(
      request('/api/v1/petals/shop/purchase', { itemId: 'accessory-glasses-round' }),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toMatchObject({
      ok: false,
      error: 'INTERNAL_ERROR',
      message: 'Purchase failed. Please try again.',
    });
    expect(JSON.stringify(body)).not.toContain('private-host');
  });

  it('purchases a canonical static cosmetic through the atomic fulfillment boundary', async () => {
    mocks.spendPetalsAndFulfill.mockResolvedValueOnce({
      newBalance: 150,
      lifetimePetalsEarned: 500,
      transactionId: 'transaction_test',
      fulfillment: { id: 'inventory_test' },
    });

    const response = await purchaseCanonicalCosmetic(
      request('/api/v1/petals/shop/purchase', { itemId: 'accessory-glasses-round' }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      ok: true,
      data: {
        itemId: 'accessory-glasses-round',
        balance: 150,
        lifetimePetalsEarned: 500,
        alreadyOwned: false,
      },
    });
    expect(mocks.spendPetalsAndFulfill).toHaveBeenCalledWith(
      'user_test',
      350,
      'Purchased cosmetic: Round Glasses',
      'petal_shop_cosmetic',
      expect.any(Function),
    );
  });

  it('rejects an unauthenticated canonical purchase before lookup or spending', async () => {
    mocks.auth.mockResolvedValueOnce({ userId: null });

    const response = await purchaseCanonicalCosmetic(
      request('/api/v1/petals/shop/purchase', { itemId: 'accessory-glasses-round' }),
    );

    expect(response.status).toBe(401);
    expect(mocks.getCosmeticItem).not.toHaveBeenCalled();
    expect(mocks.spendPetalsAndFulfill).not.toHaveBeenCalled();
  });

  it('returns a stable insufficient-funds response without entitlement writes', async () => {
    mocks.spendPetalsAndFulfill.mockRejectedValueOnce(new PetalSpendError('INSUFFICIENT_PETALS'));

    const response = await purchaseCanonicalCosmetic(
      request('/api/v1/petals/shop/purchase', { itemId: 'accessory-glasses-round' }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ ok: false, error: 'INSUFFICIENT_FUNDS' });
  });

  it('returns a stable conflict for an idempotency-key replay', async () => {
    mocks.spendPetalsAndFulfill.mockRejectedValueOnce(
      Object.assign(new Error('duplicate'), { code: 'P2002' }),
    );

    const response = await purchaseCanonicalCosmetic(
      request('/api/v1/petals/shop/purchase', { itemId: 'accessory-glasses-round' }),
    );

    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ ok: false, error: 'DUPLICATE_REQUEST' });
  });

  it('rolls back a competing canonical purchase when ownership changed inside fulfillment', async () => {
    const idempotencyCreate = vi.fn();
    const inventoryCreate = vi.fn();
    mocks.spendPetalsAndFulfill.mockImplementationOnce(async (...args: unknown[]) => {
      const fulfill = args[4] as (tx: unknown) => Promise<unknown>;
      return fulfill({
        inventoryItem: {
          findFirst: vi.fn().mockResolvedValue({ id: 'existing_entitlement' }),
          create: inventoryCreate,
        },
        idempotencyKey: { create: idempotencyCreate },
      });
    });

    const response = await purchaseCanonicalCosmetic(
      request('/api/v1/petals/shop/purchase', { itemId: 'accessory-glasses-round' }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true, data: { alreadyOwned: true } });
    expect(idempotencyCreate).not.toHaveBeenCalled();
    expect(inventoryCreate).not.toHaveBeenCalled();
  });

  it('does not disclose catalog purchase exception details', async () => {
    mocks.shopItemFindUnique.mockRejectedValueOnce(
      new Error('relation secret_table does not exist'),
    );

    const response = await purchaseCatalogItem(
      request('/api/petal-shop/purchase', { sku: 'catalog-test-cosmetic' }),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(JSON.stringify(body)).not.toContain('secret_table');
  });

  it('does not disclose owned-cosmetics lookup exception details', async () => {
    mocks.userFindUnique.mockRejectedValueOnce(new Error('private inventory query details'));

    const response = await getOwnedCosmetics(
      new NextRequest('https://preview.example/api/v1/cosmetics'),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toMatchObject({
      ok: false,
      error: 'INTERNAL_ERROR',
      message: 'Cosmetics are temporarily unavailable.',
    });
    expect(JSON.stringify(body)).not.toContain('private inventory');
  });

  it('does not disclose cosmetic-selection exception details', async () => {
    mocks.userFindUnique.mockRejectedValueOnce(new Error('private user query details'));

    const response = await equipCosmetic(
      request('/api/v1/cosmetics/equip', { hudSkinId: 'default' }),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toMatchObject({
      ok: false,
      error: 'INTERNAL_ERROR',
      message: 'Cosmetic selection could not be saved.',
    });
    expect(JSON.stringify(body)).not.toContain('private user');
  });

  it('rolls back a competing catalog purchase when ownership changed inside fulfillment', async () => {
    const idempotencyCreate = vi.fn();
    const inventoryCreate = vi.fn();
    mocks.spendPetalsAndFulfill.mockImplementationOnce(async (...args: unknown[]) => {
      const fulfill = args[4] as (tx: unknown) => Promise<unknown>;
      return fulfill({
        inventoryItem: {
          findFirst: vi.fn().mockResolvedValue({ id: 'existing_entitlement' }),
          create: inventoryCreate,
        },
        idempotencyKey: { create: idempotencyCreate },
      });
    });

    const response = await purchaseCatalogItem(
      request('/api/petal-shop/purchase', { sku: 'catalog-test-cosmetic' }, 'different-key'),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true, data: { alreadyOwned: true } });
    expect(idempotencyCreate).not.toHaveBeenCalled();
    expect(inventoryCreate).not.toHaveBeenCalled();
  });
});
