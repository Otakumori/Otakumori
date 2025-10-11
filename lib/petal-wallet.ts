import { db } from '@/app/lib/db';

export interface PetalWalletData {
  balance: number;
  lifetimeEarned: number;
  currentStreak: number;
  lastCollectedAt: Date | null;
}

/**
 * Get user's petal wallet, creating it if it doesn't exist
 */
export async function getPetalWallet(userId: string): Promise<PetalWalletData> {
  const wallet = await db.petalWallet.upsert({
    where: { userId },
    create: {
      userId,
      balance: 0,
      lifetimeEarned: 0,
      currentStreak: 0,
    },
    update: {},
  });

  return {
    balance: wallet.balance,
    lifetimeEarned: wallet.lifetimeEarned,
    currentStreak: wallet.currentStreak,
    lastCollectedAt: wallet.lastCollectedAt,
  };
}

/**
 * Add petals to user's wallet
 */
export async function addPetals(
  userId: string,
  amount: number,
  source: string,
  description?: string,
): Promise<{ balance: number; transactionId: string }> {
  const result = await db.$transaction(async (tx) => {
    const wallet = await tx.petalWallet.upsert({
      where: { userId },
      create: {
        userId,
        balance: amount,
        lifetimeEarned: amount,
        lastCollectedAt: new Date(),
      },
      update: {
        balance: { increment: amount },
        lifetimeEarned: { increment: amount },
        lastCollectedAt: new Date(),
      },
    });

    const transaction = await tx.petalTransaction.create({
      data: {
        userId,
        amount,
        source,
        description: description || `Earned ${amount} petals from ${source}`,
      },
    });

    return { balance: wallet.balance, transactionId: transaction.id };
  });

  return result;
}

/**
 * Spend petals from user's wallet
 */
export async function spendPetals(
  userId: string,
  amount: number,
  source: string,
  description?: string,
): Promise<{ balance: number; transactionId: string }> {
  const wallet = await getPetalWallet(userId);

  if (wallet.balance < amount) {
    throw new Error('INSUFFICIENT_PETALS');
  }

  const result = await db.$transaction(async (tx) => {
    const updatedWallet = await tx.petalWallet.update({
      where: { userId },
      data: {
        balance: { decrement: amount },
      },
    });

    const transaction = await tx.petalTransaction.create({
      data: {
        userId,
        amount: -amount,
        source,
        description: description || `Spent ${amount} petals on ${source}`,
      },
    });

    return { balance: updatedWallet.balance, transactionId: transaction.id };
  });

  return result;
}

/**
 * Get user's petal balance
 */
export async function getBalance(userId: string): Promise<number> {
  const wallet = await getPetalWallet(userId);
  return wallet.balance;
}

/**
 * Get user's transaction history
 */
export async function getTransactionHistory(
  userId: string,
  limit: number = 20,
): Promise<Array<{ id: string; amount: number; source: string; description: string | null; createdAt: Date }>> {
  const transactions = await db.petalTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return transactions;
}

/**
 * Check and update daily streak
 */
export async function updateStreak(userId: string): Promise<{ currentStreak: number; streakBonus: number }> {
  const wallet = await getPetalWallet(userId);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const yesterdayCollection = await db.petalTransaction.findFirst({
    where: {
      userId,
      source: 'homepage_collection',
      createdAt: { gte: yesterday },
    },
  });

  let currentStreak = 1;
  let streakBonus = 0;

  if (yesterdayCollection) {
    // Continue streak
    currentStreak = wallet.currentStreak + 1;
    streakBonus = Math.floor(currentStreak * 10); // 10 bonus petals per streak day

    await db.petalWallet.update({
      where: { userId },
      data: { currentStreak },
    });
  } else {
    // Reset streak
    await db.petalWallet.update({
      where: { userId },
      data: { currentStreak: 1 },
    });
  }

  return { currentStreak, streakBonus };
}

