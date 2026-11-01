import type { Prisma } from '@prisma/client';
import { db } from '@/app/lib/db';

export class PetalSpendError extends Error {
  constructor(
    public readonly code: 'INVALID_AMOUNT' | 'INSUFFICIENT_PETALS' | 'WALLET_UNAVAILABLE',
  ) {
    super(code);
    this.name = 'PetalSpendError';
  }
}

export interface PetalSpendResult {
  newBalance: number;
  lifetimePetalsEarned: number;
  transactionId: string;
}

/**
 * Debit the authoritative wallet inside the caller's transaction.
 *
 * The conditional update is the concurrency boundary: only one competing
 * spend can consume the final available balance. Ledger, compatibility balance,
 * transaction history, and any caller-supplied fulfillment all share the same
 * database transaction.
 */
export async function spendPetalsInTransaction(
  tx: Prisma.TransactionClient,
  userId: string,
  amount: number,
  reason: string,
  source = 'petal_spend',
): Promise<PetalSpendResult> {
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new PetalSpendError('INVALID_AMOUNT');
  }

  const debit = await tx.petalWallet.updateMany({
    where: {
      userId,
      balance: { gte: amount },
    },
    data: {
      balance: { decrement: amount },
    },
  });

  if (debit.count !== 1) {
    throw new PetalSpendError('INSUFFICIENT_PETALS');
  }

  const wallet = await tx.petalWallet.findUnique({
    where: { userId },
    select: { balance: true, lifetimeEarned: true },
  });

  if (!wallet) {
    throw new PetalSpendError('WALLET_UNAVAILABLE');
  }

  const transaction = await tx.petalTransaction.create({
    data: {
      userId,
      amount: -amount,
      source,
      description: reason,
    },
  });

  await tx.petalLedger.create({
    data: {
      userId,
      type: 'spend',
      amount: -amount,
      reason,
    },
  });

  // Keep the legacy compatibility balance reconciled to the authoritative
  // wallet instead of independently decrementing a possibly stale value.
  await tx.user.update({
    where: { id: userId },
    data: { petalBalance: wallet.balance },
  });

  return {
    newBalance: wallet.balance,
    lifetimePetalsEarned: wallet.lifetimeEarned,
    transactionId: transaction.id,
  };
}

export async function spendPetalsAndFulfill<T>(
  userId: string,
  amount: number,
  reason: string,
  source: string,
  fulfill: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<PetalSpendResult & { fulfillment: T }> {
  return db.$transaction(async (tx) => {
    const spend = await spendPetalsInTransaction(tx, userId, amount, reason, source);
    const fulfillment = await fulfill(tx);
    return { ...spend, fulfillment };
  });
}
