
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import {
  AuthenticationRequiredError,
  LocalUserUnavailableError,
  isMissingSchemaError,
  requireLocalViewer,
} from '@/app/lib/auth/viewer';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const { localUserId } = await requireLocalViewer();

    const [user, entries] = await Promise.all([
      prisma.user.findUnique({ where: { id: localUserId }, select: { petalBalance: true } }),
      prisma.petalLedger.findMany({
        where: { userId: localUserId },
        orderBy: { createdAt: 'desc' },
        take: 200,
        select: { id: true, type: true, amount: true, reason: true, createdAt: true },
      }),
    ]);

    const totalEarned = entries.filter((e) => e.amount > 0).reduce((a, b) => a + b.amount, 0);
    const totalSpent = entries
      .filter((e) => e.amount < 0)
      .reduce((a, b) => a + Math.abs(b.amount), 0);

    return NextResponse.json({
      ok: true,
      data: {
        balance: user?.petalBalance ?? 0,
        totalEarned,
        totalSpent,
        entries: entries.map((e) => ({ ...e, createdAt: e.createdAt.toISOString() })),
      },
    });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof LocalUserUnavailableError || isMissingSchemaError(error)) {
      return NextResponse.json(
        { ok: false, error: 'Petal ledger is temporarily unavailable.' },
        { status: 503 },
      );
    }
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
