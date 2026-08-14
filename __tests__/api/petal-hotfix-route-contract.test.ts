import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  calculateGameReward: vi.fn(),
  db: {
    user: { findUnique: vi.fn() },
    userAchievement: { findMany: vi.fn() },
    discountReward: { findMany: vi.fn() },
    couponGrant: { count: vi.fn() },
  },
  generateRequestId: vi.fn(),
  grantPetals: vi.fn(),
  isMissingSchemaError: vi.fn((error: any) => error?.code === 'P2021' || error?.code === 'P2022'),
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    request: vi.fn(),
    warn: vi.fn(),
  },
  prisma: {
    petalShopItem: { findMany: vi.fn() },
  },
  reqId: vi.fn(),
  requireLocalViewer: vi.fn(),
}));

vi.mock('@clerk/nextjs/server', () => ({
  auth: mocks.auth,
}));

vi.mock('@/app/config/petalTuning', () => ({
  calculateGameReward: mocks.calculateGameReward,
}));

vi.mock('@/app/lib/auth/viewer', () => {
  class AuthenticationRequiredError extends Error {
    constructor(message = 'Authentication required') {
      super(message);
      this.name = 'AuthenticationRequiredError';
    }
  }

  class LocalUserUnavailableError extends Error {
    constructor(message = 'Local user unavailable') {
      super(message);
      this.name = 'LocalUserUnavailableError';
    }
  }

  return {
    AuthenticationRequiredError,
    LocalUserUnavailableError,
    isMissingSchemaError: mocks.isMissingSchemaError,
    requireLocalViewer: mocks.requireLocalViewer,
    schemaUnavailableResponse: vi.fn((requestId: string) => ({
      ok: false,
      error: {
        code: 'SCHEMA_UNAVAILABLE',
        message: 'This account feature is temporarily unavailable while account data is prepared.',
      },
      requestId,
    })),
  };
});

vi.mock('@/app/lib/cosmetics/cosmeticsConfig', () => ({
  cosmeticItems: [],
  isNSFWCosmetic: vi.fn(() => false),
}));

vi.mock('@/app/lib/db', () => ({
  db: mocks.db,
}));

vi.mock('@/app/lib/logger', () => ({
  logger: mocks.logger,
}));

vi.mock('@/app/lib/petals/grant', () => ({
  grantPetals: mocks.grantPetals,
}));

vi.mock('@/app/lib/policy/fromRequest', () => ({
  getPolicyFromRequest: vi.fn(() => ({ nsfwAllowed: false })),
}));

vi.mock('@/app/lib/prisma', () => ({
  prisma: mocks.prisma,
}));

vi.mock('@/lib/log', () => ({
  reqId: mocks.reqId,
}));

vi.mock('@/lib/requestId', () => ({
  generateRequestId: mocks.generateRequestId,
}));

const noRawInternalDetails = /Prisma|PetalShopItem|DiscountReward|does not exist|relation|table|column|provision/i;

async function expectSchemaUnavailable(response: Response, requestId: string) {
  expect(response).toBeInstanceOf(Response);
  expect(response.status).toBe(503);
  const body = await response.json();
  expect(body).toEqual({
    ok: false,
    error: {
      code: 'SCHEMA_UNAVAILABLE',
      message: 'This account feature is temporarily unavailable while account data is prepared.',
    },
    requestId,
  });
  expect(JSON.stringify(body)).not.toMatch(noRawInternalDetails);
}

describe('petal hotfix route contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mocks.auth.mockResolvedValue({ userId: null });
    mocks.calculateGameReward.mockReturnValue(12);
    mocks.generateRequestId.mockReturnValue('route-request-id');
    mocks.isMissingSchemaError.mockImplementation(
      (error: any) => error?.code === 'P2021' || error?.code === 'P2022',
    );
    mocks.reqId.mockReturnValue('catalog-request-id');
  });

  it('petal-shop catalog returns a real bounded 503 for missing schema', async () => {
    mocks.prisma.petalShopItem.findMany.mockRejectedValue({
      code: 'P2021',
      message: 'The table public.PetalShopItem does not exist',
    });

    const { GET } = await import('@/app/api/petal-shop/catalog/route');
    const response = await GET(new NextRequest('https://www.otaku-mori.com/api/petal-shop/catalog'));

    await expectSchemaUnavailable(response, 'catalog-request-id');
  });

  it('petal-shop catalog keeps success behavior when schema exists', async () => {
    mocks.prisma.petalShopItem.findMany.mockResolvedValue([
      {
        id: 'catalog_item_1',
        sku: 'safe_cosmetic',
        metadata: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ]);

    const { GET } = await import('@/app/api/petal-shop/catalog/route');
    const response = await GET(new NextRequest('https://www.otaku-mori.com/api/petal-shop/catalog'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.items).toHaveLength(1);
    expect(body.requestId).toBe('catalog-request-id');
  });

  it('petal-shop catalog does not expose raw details for unexpected failures', async () => {
    mocks.prisma.petalShopItem.findMany.mockRejectedValue(new Error('provider exploded with stack detail'));

    const { GET } = await import('@/app/api/petal-shop/catalog/route');
    const response = await GET(new NextRequest('https://www.otaku-mori.com/api/petal-shop/catalog'));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toMatchObject({ status: 500, title: 'catalog_failed', type: 'about:blank' });
    expect(body).not.toHaveProperty('detail');
    expect(JSON.stringify(body)).not.toContain('provider exploded');
  });

  it('discount rewards returns a real bounded 503 for missing schema', async () => {
    mocks.db.discountReward.findMany.mockRejectedValue({
      code: 'P2021',
      message: 'The table public.DiscountReward does not exist',
    });

    const { GET } = await import('@/app/api/v1/petals/shop/discounts/route');
    const response = await GET(new Request('https://www.otaku-mori.com/api/v1/petals/shop/discounts'));

    await expectSchemaUnavailable(response, 'route-request-id');
  });

  it('discount rewards keeps success behavior when schema exists', async () => {
    mocks.db.discountReward.findMany.mockResolvedValue([]);

    const { GET } = await import('@/app/api/v1/petals/shop/discounts/route');
    const response = await GET(new Request('https://www.otaku-mori.com/api/v1/petals/shop/discounts'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true, data: { rewards: [] } });
  });

  it('discount rewards distinguishes unexpected failures without raw schema details', async () => {
    mocks.db.discountReward.findMany.mockRejectedValue(new Error('unexpected stack detail'));

    const { GET } = await import('@/app/api/v1/petals/shop/discounts/route');
    const response = await GET(new Request('https://www.otaku-mori.com/api/v1/petals/shop/discounts'));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ ok: false, error: 'Internal server error', requestId: 'route-request-id' });
    expect(JSON.stringify(body)).not.toContain('unexpected stack detail');
  });

  it('petals earn keeps signed-out callers bounded as guest rewards', async () => {
    mocks.auth.mockResolvedValue({ userId: null });

    const { POST } = await import('@/app/api/v1/petals/earn/route');
    const response = await POST(
      new NextRequest('https://www.otaku-mori.com/api/v1/petals/earn', {
        method: 'POST',
        body: JSON.stringify({ gameId: 'mori_runner', score: 100, didWin: true }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ ok: true, data: { earned: 12, isGuest: true } });
    expect(mocks.requireLocalViewer).not.toHaveBeenCalled();
    expect(mocks.grantPetals).not.toHaveBeenCalled();
  });

  it('petals earn grants against local User.id for authenticated viewers', async () => {
    mocks.auth.mockResolvedValue({ userId: 'clerk_user_123' });
    mocks.requireLocalViewer.mockResolvedValue({
      clerkUserId: 'clerk_user_123',
      localUserId: 'local_user_123',
      email: 'owner@example.invalid',
    });
    mocks.grantPetals.mockResolvedValue({
      success: true,
      granted: 12,
      newBalance: 24,
      lifetimeEarned: 36,
      dailyRemaining: 1988,
    });

    const { POST } = await import('@/app/api/v1/petals/earn/route');
    const response = await POST(
      new NextRequest('https://www.otaku-mori.com/api/v1/petals/earn', {
        method: 'POST',
        body: JSON.stringify({ gameId: 'mori_runner', score: 100, didWin: true }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.grantPetals).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'local_user_123',
        amount: 12,
        source: 'mini_game',
      }),
    );
    expect(mocks.grantPetals).not.toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'clerk_user_123' }),
    );
  });

  it('petals earn returns bounded 503 when local viewer provisioning is unavailable', async () => {
    const { LocalUserUnavailableError } = await import('@/app/lib/auth/viewer');
    mocks.auth.mockResolvedValue({ userId: 'clerk_user_123' });
    mocks.requireLocalViewer.mockRejectedValue(
      new LocalUserUnavailableError('Prisma provisioning failure for User'),
    );

    const { POST } = await import('@/app/api/v1/petals/earn/route');
    const response = await POST(
      new NextRequest('https://www.otaku-mori.com/api/v1/petals/earn', {
        method: 'POST',
        body: JSON.stringify({ gameId: 'mori_runner', score: 100, didWin: true }),
      }),
    );

    await expectSchemaUnavailable(response, 'route-request-id');
    expect(mocks.grantPetals).not.toHaveBeenCalled();
  });

  it('petals earn returns bounded 503 when grant storage schema is unavailable', async () => {
    mocks.auth.mockResolvedValue({ userId: 'clerk_user_123' });
    mocks.requireLocalViewer.mockResolvedValue({
      clerkUserId: 'clerk_user_123',
      localUserId: 'local_user_123',
      email: 'owner@example.invalid',
    });
    mocks.grantPetals.mockResolvedValue({
      success: false,
      granted: 0,
      newBalance: 0,
      lifetimeEarned: 0,
      error: 'Petal grants are temporarily unavailable.',
      errorCode: 'SCHEMA_UNAVAILABLE',
    });

    const { POST } = await import('@/app/api/v1/petals/earn/route');
    const response = await POST(
      new NextRequest('https://www.otaku-mori.com/api/v1/petals/earn', {
        method: 'POST',
        body: JSON.stringify({ gameId: 'mori_runner', score: 100, didWin: true }),
      }),
    );

    await expectSchemaUnavailable(response, 'route-request-id');
  });
});
