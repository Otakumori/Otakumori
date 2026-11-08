import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  walletUpsert: vi.fn(),
  walletUpdate: vi.fn(),
  transactionFindFirst: vi.fn(),
}));

vi.mock('@/app/lib/db', () => ({
  db: {
    petalWallet: {
      upsert: mocks.walletUpsert,
      update: mocks.walletUpdate,
    },
    petalTransaction: { findFirst: mocks.transactionFindFirst },
  },
}));

describe('petal wallet participation policy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.walletUpsert.mockResolvedValue({
      balance: 25,
      lifetimeEarned: 100,
      currentStreak: 8,
      lastCollectedAt: new Date('2026-10-20T12:00:00.000Z'),
    });
  });

  it('does not erase an earned streak after inactivity', async () => {
    mocks.transactionFindFirst.mockResolvedValue(null);
    const { updateStreak } = await import('@/lib/petal-wallet');

    const result = await updateStreak('user_1');

    expect(result).toEqual({ currentStreak: 8, streakBonus: 0 });
    expect(mocks.walletUpdate).not.toHaveBeenCalled();
  });

  it('continues a streak only when continuity evidence exists', async () => {
    mocks.transactionFindFirst.mockResolvedValue({ id: 'collection_1' });
    const { updateStreak } = await import('@/lib/petal-wallet');

    const result = await updateStreak('user_1');

    expect(result).toEqual({ currentStreak: 9, streakBonus: 90 });
    expect(mocks.walletUpdate).toHaveBeenCalledWith({
      where: { userId: 'user_1' },
      data: { currentStreak: 9 },
    });
  });
});
