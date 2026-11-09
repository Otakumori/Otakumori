import { auth } from '@clerk/nextjs/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/lib/db';

vi.mock('@clerk/nextjs/server', () => ({ auth: vi.fn() }));
vi.mock('@/lib/db', () => ({
  db: {
    user: { findUnique: vi.fn() },
    achievement: { findMany: vi.fn() },
    userAchievement: { findMany: vi.fn() },
  },
}));
vi.mock('@/app/lib/logger', () => ({
  logger: { error: vi.fn() },
}));

describe('GET /api/v1/achievements/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk_test' } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: 'local_test' } as never);
    vi.mocked(db.achievement.findMany).mockResolvedValue([
      {
        id: 'achievement_earned',
        code: 'earned',
        name: 'Earned mark',
        description: 'Persisted earned achievement',
        points: 10,
      },
      {
        id: 'achievement_locked',
        code: 'locked',
        name: 'Locked mark',
        description: 'Persisted locked achievement',
        points: 5,
      },
    ] as never);
    vi.mocked(db.userAchievement.findMany).mockResolvedValue([
      {
        achievementId: 'achievement_earned',
        createdAt: new Date('2026-01-02T03:04:05.000Z'),
      },
    ] as never);
  });

  it('resolves to the static database-backed handler with authenticated persisted state', async () => {
    const { GET } = await import('@/app/api/v1/achievements/me/route');
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      data: {
        achievements: [
          expect.objectContaining({
            id: 'achievement_earned',
            unlocked: true,
            unlockedAt: '2026-01-02T03:04:05.000Z',
          }),
          expect.objectContaining({ id: 'achievement_locked', unlocked: false }),
        ],
        total: 2,
      },
    });
    expect(db.user.findUnique).toHaveBeenCalledWith({
      where: { clerkId: 'clerk_test' },
      select: { id: true },
    });
    expect(db.achievement.findMany).toHaveBeenCalledTimes(1);
    expect(db.userAchievement.findMany).toHaveBeenCalledWith({
      where: { userId: 'local_test' },
      select: { achievementId: true, createdAt: true },
    });
  });

  it('rejects unauthenticated reads without querying achievement storage', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never);
    const { GET } = await import('@/app/api/v1/achievements/me/route');
    const response = await GET();

    expect(response.status).toBe(401);
    expect(db.user.findUnique).not.toHaveBeenCalled();
    expect(db.achievement.findMany).not.toHaveBeenCalled();
    expect(db.userAchievement.findMany).not.toHaveBeenCalled();
  });

  it('keeps the retired dynamic user route fail-closed', async () => {
    const { GET } = await import('@/app/api/v1/achievements/[userId]/route');
    const response = await GET();

    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      canonicalPath: '/api/v1/achievements/me',
    });
  });

  it('does not disclose database errors', async () => {
    vi.mocked(db.achievement.findMany).mockRejectedValue(
      new Error('Prisma failure containing private schema details'),
    );
    const { GET } = await import('@/app/api/v1/achievements/me/route');
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ ok: false, error: 'Internal server error' });
    expect(JSON.stringify(body)).not.toMatch(/Prisma|schema details/i);
  });
});
