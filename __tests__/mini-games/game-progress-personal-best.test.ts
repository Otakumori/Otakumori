import { beforeEach, describe, expect, it, vi } from 'vitest';

import { recordGameResult, recordPersonalBest } from '@/app/lib/games/progress';

describe('game progress personal-best adapter', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('reports an unavailable score save without claiming a best', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await expect(
      recordPersonalBest({ gameId: 'memory-match', resultKey: 'keeper:standard', score: 500 }),
    ).resolves.toEqual({
      status: 'unavailable',
      previousBest: null,
      currentBest: null,
      isNewBest: false,
    });
  });

  it('keeps the one reward call separate from the PB write', async () => {
    const earnPetals = vi.fn().mockResolvedValue({
      success: true,
      earned: 12,
      balance: 42,
      lifetimePetalsEarned: 100,
      isGuest: false,
      status: 'awarded',
    });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: { previousBest: 900, currentBest: 1200, isNewBest: true, persisted: true },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await recordGameResult(
      {
        gameId: 'otaku-beat-em-up',
        resultKey: 'arcade',
        score: 1200,
        difficulty: 'arcade',
        durationMs: 60000,
        didWin: true,
      },
      earnPetals,
    );

    expect(earnPetals).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/games/personal-best', expect.any(Object));
    expect(result.personalBest).toEqual({
      status: 'new_best',
      previousBest: 900,
      currentBest: 1200,
      isNewBest: true,
    });
  });

  it('allows PB-only retry without replaying the reward call', async () => {
    const earnPetals = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          ok: true,
          data: { previousBest: 1200, currentBest: 1200, isNewBest: false, persisted: true },
        }),
      }),
    );

    const result = await recordPersonalBest({
      gameId: 'otaku-beat-em-up',
      resultKey: 'arcade',
      score: 1200,
    });

    expect(result.status).toBe('unchanged');
    expect(earnPetals).not.toHaveBeenCalled();
  });

  it('reports reward failure separately while preserving a persisted PB result', async () => {
    const earnPetals = vi.fn().mockResolvedValue({
      success: false,
      earned: 0,
      balance: 0,
      lifetimePetalsEarned: 0,
      isGuest: false,
      status: 'unavailable',
      error: 'reward unavailable',
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          ok: true,
          data: { previousBest: null, currentBest: 800, isNewBest: true, persisted: true },
        }),
      }),
    );

    const result = await recordGameResult(
      {
        gameId: 'memory-match',
        resultKey: 'initiate:standard',
        score: 800,
        difficulty: 'initiate',
        durationMs: 30000,
        didWin: true,
      },
      earnPetals,
    );

    expect(earnPetals).toHaveBeenCalledTimes(1);
    expect(result).toEqual(
      expect.objectContaining({
        success: false,
        error: 'reward unavailable',
        personalBest: expect.objectContaining({ status: 'new_best', currentBest: 800 }),
      }),
    );
  });

  it('treats an idempotent duplicate reward as one successful canonical call', async () => {
    const earnPetals = vi.fn().mockResolvedValue({
      success: true,
      earned: 0,
      balance: 42,
      lifetimePetalsEarned: 100,
      isGuest: false,
      duplicate: true,
      status: 'duplicate',
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          ok: true,
          data: { previousBest: 800, currentBest: 800, isNewBest: false, persisted: true },
        }),
      }),
    );

    const result = await recordGameResult(
      {
        gameId: 'memory-match',
        sessionId: 'memory-match:fixed',
        resultKey: 'initiate:standard',
        score: 800,
        difficulty: 'initiate',
        durationMs: 30000,
        didWin: true,
      },
      earnPetals,
    );

    expect(earnPetals).toHaveBeenCalledTimes(1);
    expect(result.petalReward).toEqual(expect.objectContaining({ duplicate: true, earned: 0 }));
  });
});
