
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import {
  LocalUserUnavailableError,
  requireLocalViewer,
  schemaUnavailableResponse,
} from '@/app/lib/auth/viewer';
import { randomUUID } from 'crypto';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  let localUserId: string;
  try {
    ({ localUserId } = await requireLocalViewer());
  } catch (error) {
    if (error instanceof LocalUserUnavailableError) {
      return schemaUnavailableResponse('petals_user_unavailable');
    }

    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { amount, reason } = (await req.json()) as { amount: number; reason: string };
  if (!Number.isInteger(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, error: 'Invalid amount' }, { status: 400 });
  }
  const idem = req.headers.get('x-idempotency-key') ?? randomUUID();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.idempotencyKey.findUnique({ where: { key: idem } });
      if (existing) return 'DUP' as const;
      await tx.idempotencyKey.create({
        data: {
          key: idem,
          purpose: 'petals/spend',
        },
      });

      const user = await tx.user.findUnique({
        where: { id: localUserId },
        select: { petalBalance: true },
      });
      const balance = user?.petalBalance ?? 0;
      if (balance < amount) throw new Error('Insufficient petals');

      await tx.user.update({ where: { id: localUserId }, data: { petalBalance: { decrement: amount } } });
      await tx.petalLedger.create({
        data: { userId: localUserId, type: 'spend', amount: -amount, reason: reason || 'spend' },
      });

      const [updated, entries] = await Promise.all([
        tx.user.findUnique({ where: { id: localUserId }, select: { petalBalance: true } }),
        tx.petalLedger.findMany({
          where: { userId: localUserId },
          orderBy: { createdAt: 'desc' },
          take: 200,
        }),
      ]);

      const totalEarned = entries.filter((e) => e.amount > 0).reduce((a, b) => a + b.amount, 0);
      const totalSpent = entries
        .filter((e) => e.amount < 0)
        .reduce((a, b) => a + Math.abs(b.amount), 0);

      return {
        balance: updated?.petalBalance ?? 0,
        totalEarned,
        totalSpent,
        entries: entries.map((e) => ({ ...e, createdAt: e.createdAt.toISOString() })),
      };
    });

    if (result === 'DUP') {
      const ledger = await currentLedger(localUserId);
      return NextResponse.json({ ok: true, data: ledger });
    }
    return NextResponse.json({ ok: true, data: result });
  } catch (e: any) {
    const msg = e?.message || 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}

async function currentLedger(userId: string) {
  const [user, entries] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { petalBalance: true } }),
    prisma.petalLedger.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 200 }),
  ]);
  const totalEarned = entries.filter((e) => e.amount > 0).reduce((a, b) => a + b.amount, 0);
  const totalSpent = entries
    .filter((e) => e.amount < 0)
    .reduce((a, b) => a + Math.abs(b.amount), 0);
  return {
    balance: user?.petalBalance ?? 0,
    totalEarned,
    totalSpent,
    entries: entries.map((e) => ({ ...e, createdAt: e.createdAt.toISOString() })),
  };
}
