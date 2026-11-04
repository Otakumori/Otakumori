import { describe, expect, it, vi } from 'vitest';
import { PetalSpendError, spendPetalsInTransaction } from '@/app/lib/petals/spend';

function transactionClient(overrides: Record<string, unknown> = {}) {
  return {
    petalWallet: {
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      findUnique: vi.fn().mockResolvedValue({ balance: 40, lifetimeEarned: 100 }),
    },
    petalTransaction: {
      create: vi.fn().mockResolvedValue({ id: 'transaction_1' }),
    },
    petalLedger: { create: vi.fn().mockResolvedValue({ id: 'ledger_1' }) },
    user: { update: vi.fn().mockResolvedValue({ id: 'user_1' }) },
    ...overrides,
  };
}

describe('atomic petal spending', () => {
  it('conditionally debits the authoritative wallet and reconciles all records', async () => {
    const tx = transactionClient();

    const result = await spendPetalsInTransaction(
      tx as never,
      'user_1',
      10,
      'Purchased a relic',
      'test_purchase',
    );

    expect(tx.petalWallet.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user_1', balance: { gte: 10 } },
      data: { balance: { decrement: 10 } },
    });
    expect(tx.petalTransaction.create).toHaveBeenCalledWith({
      data: {
        userId: 'user_1',
        amount: -10,
        source: 'test_purchase',
        description: 'Purchased a relic',
      },
    });
    expect(tx.petalLedger.create).toHaveBeenCalledWith({
      data: { userId: 'user_1', type: 'spend', amount: -10, reason: 'Purchased a relic' },
    });
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: 'user_1' },
      data: { petalBalance: 40 },
    });
    expect(result).toEqual({
      newBalance: 40,
      lifetimePetalsEarned: 100,
      transactionId: 'transaction_1',
    });
  });

  it('allows only one competing spend to consume the last available balance', async () => {
    const updateMany = vi
      .fn()
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });
    const tx = transactionClient({
      petalWallet: {
        updateMany,
        findUnique: vi.fn().mockResolvedValue({ balance: 0, lifetimeEarned: 10 }),
      },
    });

    const outcomes = await Promise.allSettled([
      spendPetalsInTransaction(tx as never, 'user_1', 10, 'first'),
      spendPetalsInTransaction(tx as never, 'user_1', 10, 'second'),
    ]);

    expect(outcomes[0]?.status).toBe('fulfilled');
    expect(outcomes[1]?.status).toBe('rejected');
    expect((outcomes[1] as PromiseRejectedResult).reason).toMatchObject({
      code: 'INSUFFICIENT_PETALS',
    });
    expect(tx.petalTransaction.create).toHaveBeenCalledTimes(1);
    expect(tx.petalLedger.create).toHaveBeenCalledTimes(1);
  });

  it.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])(
    'rejects an invalid amount before mutation: %s',
    async (amount) => {
      const tx = transactionClient();

      await expect(
        spendPetalsInTransaction(tx as never, 'user_1', amount, 'invalid'),
      ).rejects.toEqual(
        expect.objectContaining<Partial<PetalSpendError>>({ code: 'INVALID_AMOUNT' }),
      );
      expect(tx.petalWallet.updateMany).not.toHaveBeenCalled();
    },
  );

  it('stops before ledger writes when funds are insufficient', async () => {
    const tx = transactionClient({
      petalWallet: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        findUnique: vi.fn(),
      },
    });

    await expect(
      spendPetalsInTransaction(tx as never, 'user_1', 50, 'too expensive'),
    ).rejects.toMatchObject({ code: 'INSUFFICIENT_PETALS' });
    expect(tx.petalWallet.findUnique).not.toHaveBeenCalled();
    expect(tx.petalTransaction.create).not.toHaveBeenCalled();
    expect(tx.petalLedger.create).not.toHaveBeenCalled();
    expect(tx.user.update).not.toHaveBeenCalled();
  });
});
