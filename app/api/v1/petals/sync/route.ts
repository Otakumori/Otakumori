import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { generateRequestId } from '@/lib/requestId';
import { z } from 'zod';

export const runtime = 'nodejs';

const SyncPetalsSchema = z.object({
  localBalance: z.number().min(0),
  localTransactions: z
    .array(
      z.object({
        id: z.string(),
        amount: z.number(),
        source: z.string(),
        timestamp: z.number(),
      }),
    )
    .optional(),
});

/**
 * Sync petal balance across devices
 * Merges local and cloud petal totals with conflict resolution
 */
export async function POST(req: NextRequest) {
  const requestId = generateRequestId();

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'AUTH_REQUIRED', requestId },
        { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } },
      );
    }

    const body = await req.json();
    // localBalance/localTransactions are accepted for reconciliation reporting
    // only. They are NEVER used to inflate the server-authoritative balance,
    // because the client cannot be trusted to report its own petal totals.
    const { localBalance } = SyncPetalsSchema.parse(body);

    // The PetalWallet is the source of truth. Sync is a reconciliation READ:
    // we surface the authoritative cloud balance to the client and let the
    // client reconcile downward. We never take Math.max(cloud, local) or write
    // client-supplied balances/transactions into the ledger.
    const cloudWallet = await db.petalWallet.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        balance: 0,
        lifetimeEarned: 0,
        lastCollectedAt: new Date(),
      },
    });

    const cloudBalance = cloudWallet.balance;

    return NextResponse.json({
      ok: true,
      data: {
        syncedBalance: cloudBalance,
        cloudBalance,
        localBalance,
        // A conflict simply means the client reported a different total; the
        // cloud value always wins.
        conflict: localBalance !== cloudBalance,
        lastSyncedAt: new Date().toISOString(),
      },
      requestId,
    });
  } catch (error: any) {
    logger.error('[Petal Sync] Error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      {
        ok: false,
        error: 'INTERNAL_ERROR',
        message: error.message,
        requestId,
      },
      { status: 500 },
    );
  }
}
