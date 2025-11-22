/**
 * Petal Database Operations
 *
 * Database-specific functions for Petal transactions using Prisma.
 * These complement the pure functions in lib/petals.ts
 */

import { db } from '@/app/lib/db';

export async function ensureUserByClerkId(clerkId: string) {
  // Minimal upsert to guarantee a row exists; mimic existing patterns
  const email = `${clerkId}@temp.com`;
  const username = `user_${clerkId.slice(0, 8)}`;
  const user = await db.user.upsert({
    where: { clerkId },
    update: {},
    create: {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      clerkId,
      email,
      username,
    },
    select: { id: true, petalBalance: true },
  });
  return user;
}

export async function creditPetals(clerkId: string, amount: number, reason: string) {
  try {
    if (amount <= 0) return { success: false, balance: 0, error: 'Amount must be positive' };

    const user = await ensureUserByClerkId(clerkId);
    const updated = await db.$transaction(async (tx) => {
      await tx.petalLedger.create({
        data: { userId: user.id, type: 'earn', amount, reason },
      });
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { petalBalance: { increment: amount } },
        select: { petalBalance: true },
      });
      return updatedUser;
    });

    return { success: true, balance: updated.petalBalance };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Credit failed';
    return { success: false, balance: 0, error: message };
  }
}

export async function debitPetals(clerkId: string, amount: number, reason: string) {
  try {
    if (amount <= 0) return { success: false, balance: 0, error: 'Amount must be positive' };

    const user = await ensureUserByClerkId(clerkId);
    const updated = await db.$transaction(async (tx) => {
      const current = await tx.user.findUnique({
        where: { id: user.id },
        select: { petalBalance: true },
      });
      const balance = current?.petalBalance ?? 0;
      if (balance < amount) {
        throw Object.assign(new Error('INSUFFICIENT_FUNDS'), { code: 'INSUFFICIENT_FUNDS' });
      }
      await tx.petalLedger.create({ data: { userId: user.id, type: 'spend', amount, reason } });
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { petalBalance: { decrement: amount } },
        select: { petalBalance: true },
      });
      return updatedUser;
    });

    return { success: true, balance: updated.petalBalance };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Debit failed';
    return { success: false, balance: 0, error: message };
  }
}
