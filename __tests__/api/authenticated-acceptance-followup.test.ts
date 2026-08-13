import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  appDb: {
    user: { findUnique: vi.fn() },
    activity: { findMany: vi.fn() },
    petalLedger: {
      aggregate: vi.fn(),
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
    userAchievement: { findMany: vi.fn() },
    inventoryItem: { findMany: vi.fn() },
    couponGrant: { count: vi.fn() },
  },
  rootDb: {
    user: { findUnique: vi.fn() },
    order: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
  petalServiceGetUserPetalInfo: vi.fn(),
  rateLimited: false,
  wrappedCalls: 0,
  loggerError: vi.fn(),
  loggerWarn: vi.fn(),
}));

vi.mock('@clerk/nextjs/server', () => ({
  auth: mocks.auth,
}));

vi.mock('@/app/lib/db', () => ({
  db: mocks.appDb,
}));

vi.mock('@/lib/db', () => ({
  db: mocks.rootDb,
}));

vi.mock('@/app/lib/petals', () => ({
  PetalService: vi.fn(() => ({
    getUserPetalInfo: mocks.petalServiceGetUserPetalInfo,
  })),
}));

vi.mock('@/app/lib/logger', () => ({
  logger: {
    error: mocks.loggerError,
    warn: mocks.loggerWarn,
  },
}));

vi.mock('@/app/lib/rate-limiting', () => ({
  withRateLimit: vi.fn(
    (_key: string, handler: (request: NextRequest) => Promise<Response>) =>
      async (request: NextRequest) => {
        mocks.wrappedCalls += 1;
        if (mocks.rateLimited) {
          return Response.json({ ok: false, error: 'Rate limit exceeded' }, { status: 429 });
        }
        return handler(request);
      },
  ),
}));

function request(path: string, init?: RequestInit) {
  return new NextRequest(`http://localhost${path}`, init);
}

async function json(response: Response) {
  return response.json() as Promise<any>;
}

describe('orders authenticated acceptance follow-up', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mocks.auth.mockResolvedValue({ userId: 'clerk_user_123' });
    mocks.rootDb.user.findUnique.mockResolvedValue({ id: 'local_user_123' });
    mocks.rootDb.order.findMany.mockResolvedValue([]);
  });

  it('returns bounded 200 for an authenticated local viewer with no orders', async () => {
    const { GET } = await import('@/app/api/orders/route');

    const response = await GET(request('/api/orders'));
    const body = await json(response);

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true, data: { orders: [] } });
    expect(mocks.rootDb.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'local_user_123' } }),
    );
    expect(mocks.rootDb.order.create).not.toHaveBeenCalled();
  });

  it('returns bounded 500 without raw Prisma text on database failure', async () => {
    mocks.rootDb.order.findMany.mockRejectedValue(
      new Error(
        'Invalid prisma.order.findMany invocation: missing column Order.appliedCouponCodes',
      ),
    );
    const { GET } = await import('@/app/api/orders/route');

    const response = await GET(request('/api/orders'));
    const body = await json(response);

    expect(response.status).toBe(500);
    expect(body).toEqual({ ok: false, error: 'Internal server error' });
    expect(JSON.stringify(body)).not.toContain('Prisma');
    expect(JSON.stringify(body)).not.toContain('appliedCouponCodes');
    expect(mocks.rootDb.order.create).not.toHaveBeenCalled();
  });
});

describe('petal summary authenticated acceptance follow-up', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mocks.auth.mockResolvedValue({ userId: 'clerk_user_123' });
    mocks.appDb.user.findUnique.mockResolvedValue({ id: 'local_user_123' });
    mocks.petalServiceGetUserPetalInfo.mockResolvedValue({
      success: true,
      data: {
        balance: 0,
        lifetimePetalsEarned: 0,
      },
    });
    mocks.appDb.petalLedger.aggregate.mockResolvedValue({ _sum: { amount: null } });
    mocks.appDb.petalLedger.findMany.mockResolvedValue([]);
    mocks.appDb.petalLedger.groupBy.mockResolvedValue([]);
    mocks.appDb.userAchievement.findMany.mockResolvedValue([]);
    mocks.appDb.inventoryItem.findMany.mockResolvedValue([]);
    mocks.appDb.couponGrant.count.mockResolvedValue(0);
  });

  it('returns a truthful zero summary for empty ledger data', async () => {
    const { GET } = await import('@/app/api/v1/petals/summary/route');

    const response = await GET();
    const body = await json(response);

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      ok: true,
      data: {
        balance: 0,
        lifetimePetalsEarned: 0,
        todayEarned: 0,
        achievements: { count: 0, petalsEarned: 0 },
        cosmetics: { totalOwned: 0, hudSkins: 0, avatarCosmetics: 0 },
        vouchers: { activeCount: 0 },
      },
    });
    expect(mocks.appDb.petalLedger.findMany).toHaveBeenCalled();
  });

  it('returns 401 when unauthenticated', async () => {
    mocks.auth.mockResolvedValue({ userId: null });
    const { GET } = await import('@/app/api/v1/petals/summary/route');

    const response = await GET();

    expect(response.status).toBe(401);
  });

  it('keeps local user absence bounded', async () => {
    mocks.appDb.user.findUnique.mockResolvedValue(null);
    const { GET } = await import('@/app/api/v1/petals/summary/route');

    const response = await GET();
    const body = await json(response);

    expect(response.status).toBe(404);
    expect(body).toEqual({ ok: false, error: 'User not found' });
  });

  it('returns bounded 500 without raw Prisma text on database failure', async () => {
    mocks.appDb.petalLedger.findMany.mockRejectedValue(
      new Error(
        'Invalid prisma.petalLedger.findMany invocation: missing column PetalLedger.updatedAt',
      ),
    );
    const { GET } = await import('@/app/api/v1/petals/summary/route');

    const response = await GET();
    const body = await json(response);

    expect(response.status).toBe(500);
    expect(body).toEqual({ ok: false, error: 'Internal server error' });
    expect(JSON.stringify(body)).not.toContain('Prisma');
    expect(JSON.stringify(body)).not.toContain('PetalLedger.updatedAt');
  });
});

describe('activity feed authenticated acceptance follow-up', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mocks.rateLimited = false;
    mocks.wrappedCalls = 0;
    mocks.auth.mockResolvedValue({ userId: 'clerk_user_123' });
    mocks.appDb.user.findUnique.mockResolvedValue({ id: 'local_user_123' });
    mocks.appDb.activity.findMany.mockResolvedValue([]);
  });

  it('exports a GET handler that returns a Response', async () => {
    const { GET } = await import('@/app/api/v1/activity/feed/route');

    const response = await GET(request('/api/v1/activity/feed'));

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);
    expect(mocks.wrappedCalls).toBe(1);
  });

  it('returns 401 when unauthenticated', async () => {
    mocks.auth.mockResolvedValue({ userId: null });
    const { GET } = await import('@/app/api/v1/activity/feed/route');

    const response = await GET(request('/api/v1/activity/feed'));

    expect(response.status).toBe(401);
  });

  it('returns 404 when the local user is absent', async () => {
    mocks.appDb.user.findUnique.mockResolvedValue(null);
    const { GET } = await import('@/app/api/v1/activity/feed/route');

    const response = await GET(request('/api/v1/activity/feed'));

    expect(response.status).toBe(404);
  });

  it('returns 200 for an empty activity feed', async () => {
    const { GET } = await import('@/app/api/v1/activity/feed/route');

    const response = await GET(request('/api/v1/activity/feed?limit=10'));
    const body = await json(response);

    expect(response.status).toBe(200);
    expect(body.data.activities).toEqual([]);
    expect(body.data.total).toBe(0);
    expect(mocks.appDb.activity.findMany).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid activity pagination before querying Prisma', async () => {
    const { GET } = await import('@/app/api/v1/activity/feed/route');

    const response = await GET(request('/api/v1/activity/feed?limit=abc&offset=-1'));
    const body = await json(response);

    expect(response.status).toBe(400);
    expect(body.error).toBe('Invalid pagination parameters');
    expect(mocks.appDb.activity.findMany).not.toHaveBeenCalled();
  });

  it('caps excessive activity limits at the bounded maximum', async () => {
    const { GET } = await import('@/app/api/v1/activity/feed/route');

    const response = await GET(request('/api/v1/activity/feed?limit=500&offset=2'));

    expect(response.status).toBe(200);
    expect(mocks.appDb.activity.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 50,
        skip: 2,
      }),
    );
  });

  it('returns 200 for a populated activity feed', async () => {
    mocks.appDb.activity.findMany.mockResolvedValue([
      {
        id: 'activity_1',
        type: 'petal',
        payload: { amount: 5, source: 'profile' },
        createdAt: new Date('2026-07-28T12:00:00.000Z'),
      },
    ]);
    const { GET } = await import('@/app/api/v1/activity/feed/route');

    const response = await GET(request('/api/v1/activity/feed'));
    const body = await json(response);

    expect(response.status).toBe(200);
    expect(body.data.activities).toHaveLength(1);
    expect(body.data.activities[0]).toMatchObject({
      id: 'activity_1',
      type: 'petal',
    });
  });

  it('returns bounded 500 on database failure', async () => {
    mocks.appDb.activity.findMany.mockRejectedValue(new Error('database failed'));
    const { GET } = await import('@/app/api/v1/activity/feed/route');

    const response = await GET(request('/api/v1/activity/feed'));
    const body = await json(response);

    expect(response.status).toBe(500);
    expect(body.error).toBe('Failed to fetch activity feed');
    expect(JSON.stringify(body)).not.toContain('database failed');
  });

  it('returns 429 when rate limited without invoking the database handler', async () => {
    mocks.rateLimited = true;
    const { GET } = await import('@/app/api/v1/activity/feed/route');

    const response = await GET(request('/api/v1/activity/feed'));

    expect(response.status).toBe(429);
    expect(mocks.appDb.activity.findMany).not.toHaveBeenCalled();
  });
});
