// @vitest-environment node

import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  count: vi.fn(),
  create: vi.fn(),
  updateMany: vi.fn(),
  grantPetals: vi.fn(),
  track: vi.fn(),
}));

vi.mock('@clerk/nextjs/server', () => ({ auth: vi.fn() }));
vi.mock('@/lib/petals-db', () => ({ ensureUserByClerkId: vi.fn() }));
vi.mock('@/app/lib/db', () => ({
  db: {
    leaderboardScore: {
      findMany: mocks.findMany,
      count: mocks.count,
      create: mocks.create,
      updateMany: mocks.updateMany,
    },
  },
}));
vi.mock('@/app/lib/petals/grant', () => ({ grantPetals: mocks.grantPetals }));
vi.mock('@/lib/monitoring/advanced-metrics', () => ({
  metricsCollector: { track: mocks.track },
}));
vi.mock('@/lib/security/rate-limiting', () => ({
  withRateLimit: (handler: unknown) => handler,
}));
vi.mock('@/lib/security/headers', () => ({
  withSecurityHeaders: (handler: unknown) => handler,
}));
vi.mock('@/app/lib/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));

import { GET, POST } from '@/app/api/v1/leaderboards/[gameId]/route';

describe('leaderboard submission containment', () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([
    ['forged score', 'petal-samurai', 999_999_999, 'valid-looking'],
    ['repeated submission', 'petal-samurai', 999_999_999, 'valid-looking'],
    ['arbitrary game', 'attacker-controlled-game', 1, 'valid-looking'],
    ['forged checksum', 'petal-samurai', 1, 'forged-checksum'],
  ])('returns 410 for %s without score or reward mutation', async (_case, gameId, score, checksum) => {
    const request = new NextRequest(`https://www.otaku-mori.com/api/v1/leaderboards/${gameId}`, {
      method: 'POST',
      body: JSON.stringify({
        score,
        category: 'score',
        metadata: { playtime: 1, checksum },
      }),
    });

    const response = await POST();

    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: 'LEGACY_REWARD_ROUTE_DISABLED',
    });
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.updateMany).not.toHaveBeenCalled();
    expect(mocks.grantPetals).not.toHaveBeenCalled();
    expect(mocks.track).not.toHaveBeenCalled();
    expect(request.method).toBe('POST');
  });

  it('preserves GET while marking historical entries unverified', async () => {
    mocks.findMany.mockResolvedValue([
      {
        userId: 'local_user',
        score: 123,
        statsJson: { verified: true, checksum: 'browser-authored' },
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        User: {
          id: 'local_user',
          username: 'player',
          displayName: 'Player',
          avatarUrl: null,
        },
      },
    ]);
    mocks.count.mockResolvedValue(1);
    mocks.track.mockResolvedValue(undefined);

    const response = await GET(
      new NextRequest('https://www.otaku-mori.com/api/v1/leaderboards/petal-samurai'),
      { params: { gameId: 'petal-samurai' } },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.leaderboard[0]).toMatchObject({
      score: 123,
      verified: false,
      metadata: { checksum: 'browser-authored' },
    });
    expect(body.data.leaderboard[0].metadata).not.toHaveProperty('verified');
  });
});
