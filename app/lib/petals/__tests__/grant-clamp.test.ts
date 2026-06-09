import { beforeEach, describe, expect, it, vi } from 'vitest';

const checkRateLimitMock = vi.fn();
const getClientIdentifierMock = vi.fn(() => 'test-identifier');

const txMock = {
  petalWallet: {
    upsert: vi.fn(),
  },
  petalTransaction: {
    create: vi.fn(),
  },
  petalLedger: {
    create: vi.fn(),
  },
  user: {
    updateMany: vi.fn(),
  },
};

const dbMock = {
  petalTransaction: {
    aggregate: vi.fn(),
  },
  petalWallet: {
    findUnique: vi.fn(),
  },
  $transaction: vi.fn(async (cb: (tx: typeof txMock) => unknown) => cb(txMock)),
};

vi.mock('@/app/lib/rate-limiting', () => ({
  checkRateLimit: checkRateLimitMock,
  getClientIdentifier: getClientIdentifierMock,
}));

vi.mock('@/lib/db', () => ({ db: dbMock }));

vi.mock('@/app/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

describe('grantPetals server-side clamping (anti-exploit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkRateLimitMock.mockResolvedValue({ success: true });
    dbMock.petalTransaction.aggregate.mockResolvedValue({ _sum: { amount: 0 } });
    txMock.petalWallet.upsert.mockResolvedValue({ balance: 5, lifetimeEarned: 5 });
    txMock.petalTransaction.create.mockResolvedValue({});
    txMock.petalLedger.create.mockResolvedValue({});
    txMock.user.updateMany.mockResolvedValue({});
  });

  it('clamps a large in-range request to the source maxPerEvent', async () => {
    const { grantPetals } = await import('../grant');

    // background_petal_click has maxPerEvent: 5. A client requesting 1000 must
    // never be granted more than 5.
    const result = await grantPetals({
      userId: 'user_attacker',
      amount: 1000,
      source: 'background_petal_click',
    });

    expect(result.success).toBe(true);
    expect(result.granted).toBe(5);
    expect(txMock.petalTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ amount: 5 }) }),
    );
  });

  it('rejects out-of-range huge amounts entirely', async () => {
    const { grantPetals } = await import('../grant');

    const result = await grantPetals({
      userId: 'user_attacker',
      amount: 9_999_999,
      source: 'mini_game',
    });

    expect(result.success).toBe(false);
    expect(result.granted).toBe(0);
    expect(result.errorCode).toBe('VALIDATION_ERROR');
    expect(txMock.petalTransaction.create).not.toHaveBeenCalled();
  });

  it('clamps to the remaining daily allowance', async () => {
    // background_petal_click maxPerDay: 50; already earned 48 today.
    dbMock.petalTransaction.aggregate.mockResolvedValue({ _sum: { amount: 48 } });
    txMock.petalWallet.upsert.mockResolvedValue({ balance: 50, lifetimeEarned: 50 });

    const { grantPetals } = await import('../grant');

    const result = await grantPetals({
      userId: 'user_attacker',
      amount: 1000,
      source: 'background_petal_click',
    });

    expect(result.success).toBe(true);
    // min(maxPerEvent=5, dailyRemaining=2) === 2
    expect(result.granted).toBe(2);
  });
});
