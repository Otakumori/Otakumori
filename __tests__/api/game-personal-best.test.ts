import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POST } from '@/app/api/v1/games/personal-best/route';
import { AuthenticationRequiredError, requireLocalViewer } from '@/app/lib/auth/viewer';
import { db } from '@/lib/db';

const grantPetals = vi.fn();

vi.mock('@/app/lib/auth/viewer', () => ({
  AuthenticationRequiredError: class AuthenticationRequiredError extends Error {},
  LocalUserUnavailableError: class LocalUserUnavailableError extends Error {},
  isMissingSchemaError: vi.fn(() => false),
  requireLocalViewer: vi.fn(),
  schemaUnavailableResponse: vi.fn(() => ({ ok: false, error: 'SCHEMA_UNAVAILABLE' })),
}));

vi.mock('@/app/lib/petals/grant', () => ({ grantPetals }));

vi.mock('@/lib/db', () => ({
  db: {
    leaderboardScore: {
      create: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

function request(body: unknown) {
  return new NextRequest('http://localhost/api/v1/games/personal-best', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

describe('reward-free game personal-best authority', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireLocalViewer).mockResolvedValue({ localUserId: 'local-user' } as never);
  });

  it('creates the first best without touching Petal reward authority', async () => {
    vi.mocked(db.leaderboardScore.findFirst)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'pb-1', score: 1200 } as never);
    vi.mocked(db.leaderboardScore.create).mockResolvedValue({ id: 'pb-1' } as never);

    const response = await POST(
      request({ gameId: 'petal-samurai', resultKey: 'timed:normal', score: 1200 }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data).toEqual(
      expect.objectContaining({
        submittedScore: 1200,
        previousBest: null,
        currentBest: 1200,
        isNewBest: true,
        persisted: true,
      }),
    );
    expect(grantPetals).not.toHaveBeenCalled();
  });

  it('accepts a canonical secondary-game identity without touching Petal rewards', async () => {
    vi.mocked(db.leaderboardScore.findFirst)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'pb-secondary', score: 640 } as never);
    vi.mocked(db.leaderboardScore.create).mockResolvedValue({ id: 'pb-secondary' } as never);

    const response = await POST(
      request({ gameId: 'bubble-ragdoll', resultKey: 'pop-12', score: 640 }),
    );

    expect(response.status).toBe(200);
    expect(grantPetals).not.toHaveBeenCalled();
  });

  it('rejects an unauthenticated submission before persistence', async () => {
    vi.mocked(requireLocalViewer).mockRejectedValue(new AuthenticationRequiredError());

    const response = await POST(
      request({ gameId: 'petal-samurai', resultKey: 'timed:normal', score: 1200 }),
    );

    expect(response.status).toBe(401);
    expect(db.leaderboardScore.findFirst).not.toHaveBeenCalled();
    expect(grantPetals).not.toHaveBeenCalled();
  });

  it('does not overwrite a higher existing best', async () => {
    vi.mocked(db.leaderboardScore.findFirst)
      .mockResolvedValueOnce({ id: 'pb-1', score: 2400 } as never)
      .mockResolvedValueOnce({ id: 'pb-1', score: 2400 } as never);

    const response = await POST(
      request({ gameId: 'memory-match', resultKey: 'keeper:standard', score: 1800 }),
    );
    const payload = await response.json();

    expect(payload.data).toEqual(
      expect.objectContaining({ previousBest: 2400, currentBest: 2400, isNewBest: false }),
    );
    expect(db.leaderboardScore.updateMany).not.toHaveBeenCalled();
    expect(grantPetals).not.toHaveBeenCalled();
  });

  it('updates a best monotonically', async () => {
    vi.mocked(db.leaderboardScore.findFirst)
      .mockResolvedValueOnce({ id: 'pb-1', score: 900 } as never)
      .mockResolvedValueOnce({ id: 'pb-1', score: 1500 } as never);
    vi.mocked(db.leaderboardScore.updateMany).mockResolvedValue({ count: 1 });

    const response = await POST(
      request({ gameId: 'blossomware', resultKey: 'short', score: 1500 }),
    );
    const payload = await response.json();

    expect(payload.data).toEqual(
      expect.objectContaining({ previousBest: 900, currentBest: 1500, isNewBest: true }),
    );
    expect(db.leaderboardScore.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'pb-1', score: { lt: 1500 } } }),
    );
  });

  it('recovers a concurrent first-write race without misreporting a lower score as new', async () => {
    vi.mocked(db.leaderboardScore.findFirst)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'pb-concurrent', score: 1800 } as never)
      .mockResolvedValueOnce({ id: 'pb-concurrent', score: 1800 } as never);
    vi.mocked(db.leaderboardScore.create).mockRejectedValue(new Error('unique constraint'));
    vi.mocked(db.leaderboardScore.updateMany).mockResolvedValue({ count: 0 });

    const response = await POST(
      request({ gameId: 'petal-storm-rhythm', resultKey: 'sakura-dreams:normal', score: 1500 }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data).toEqual(
      expect.objectContaining({ previousBest: 1800, currentBest: 1800, isNewBest: false }),
    );
    expect(grantPetals).not.toHaveBeenCalled();
  });

  it('rejects unsupported game IDs before persistence', async () => {
    const response = await POST(
      request({ gameId: 'bubble-girl', resultKey: 'default', score: 100 }),
    );

    expect(response.status).toBe(400);
    expect(db.leaderboardScore.findFirst).not.toHaveBeenCalled();
  });

  it('returns failure when persistence does not produce a score row', async () => {
    vi.mocked(db.leaderboardScore.findFirst).mockResolvedValue(null);
    vi.mocked(db.leaderboardScore.create).mockResolvedValue({ id: 'pb-1' } as never);

    const response = await POST(
      request({ gameId: 'otaku-beat-em-up', resultKey: 'story', score: 5000 }),
    );
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.ok).toBe(false);
    expect(payload.error).toBe('PERSONAL_BEST_UNAVAILABLE');
  });
});
