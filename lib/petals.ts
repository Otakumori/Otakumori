import { prisma } from '@/app/lib/prisma';

export async function ensureUserByClerkId(clerkId: string) {
  // Minimal upsert to guarantee a row exists; mimic existing patterns
  const email = `${clerkId}@temp.com`;
  const username = `user_${clerkId.slice(0, 8)}`;
  const user = await prisma.user.upsert({
    where: { clerkId },
    update: {},
    create: { clerkId, email, username },
    select: { id: true, petalBalance: true },
  });
  return user;
}

export async function creditPetals(clerkId: string, amount: number, reason: string) {
  if (amount <= 0) return { balance: 0 };
  const user = await ensureUserByClerkId(clerkId);
  const updated = await prisma.$transaction(async (tx) => {
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
  return { balance: updated.petalBalance };
}

export async function debitPetals(clerkId: string, amount: number, reason: string) {
  if (amount <= 0) return { balance: 0 };
  const user = await ensureUserByClerkId(clerkId);
  const updated = await prisma.$transaction(async (tx) => {
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
  return { balance: updated.petalBalance };
}
