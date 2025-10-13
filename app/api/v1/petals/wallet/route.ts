import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { generateRequestId } from '@/lib/requestId';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const requestId = generateRequestId();

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'AUTH_REQUIRED', requestId },
        { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } },
      );
    }

    // Get or create wallet
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

    // Get today's collection progress
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCollected = await db.petalTransaction.aggregate({
      where: {
        userId,
        source: 'homepage_collection',
        createdAt: { gte: today },
      },
      _sum: { amount: true },
    });

    // Get recent transactions
    const recentTransactions = await db.petalTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      ok: true,
      data: {
        balance: wallet.balance,
        lifetimeEarned: wallet.lifetimeEarned,
        currentStreak: wallet.currentStreak,
        lastCollectedAt: wallet.lastCollectedAt,
        todayCollected: todayCollected._sum.amount || 0,
        dailyLimit: 1000,
        recentTransactions: recentTransactions.map((t) => ({
          id: t.id,
          amount: t.amount,
          source: t.source,
          description: t.description,
          createdAt: t.createdAt,
        })),
      },
      requestId,
    });
  } catch (error: any) {
    console.error('[Petals Wallet] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR', message: error.message, requestId },
      { status: 500 },
    );
  }
}
