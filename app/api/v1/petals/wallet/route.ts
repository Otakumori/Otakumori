import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import {
  AuthenticationRequiredError,
  LocalUserUnavailableError,
  isMissingSchemaError,
  requireLocalViewer,
  schemaUnavailableResponse,
} from '@/app/lib/auth/viewer';
import { generateRequestId } from '@/lib/requestId';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  const requestId = generateRequestId();

  try {
    const { localUserId } = await requireLocalViewer();

    // Get or create wallet
    const wallet = await db.petalWallet.upsert({
      where: { userId: localUserId },
      create: {
        userId: localUserId,
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
        userId: localUserId,
        source: 'homepage_collection',
        createdAt: { gte: today },
      },
      _sum: { amount: true },
    });

    // Get recent transactions
    const recentTransactions = await db.petalTransaction.findMany({
      where: { userId: localUserId },
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
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json(
        { ok: false, error: 'AUTH_REQUIRED', requestId },
        { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } },
      );
    }
    if (error instanceof LocalUserUnavailableError || isMissingSchemaError(error)) {
      return NextResponse.json(schemaUnavailableResponse(requestId), { status: 503 });
    }
    logger.error('[Petals Wallet] Error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR', message: 'Petal wallet is temporarily unavailable.', requestId },
      { status: 500 },
    );
  }
}
