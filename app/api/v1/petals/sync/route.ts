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
    const { localBalance, localTransactions } = SyncPetalsSchema.parse(body);

    // Get cloud wallet
    const cloudWallet = await db.petalWallet.findUnique({
      where: { userId },
    });

    if (!cloudWallet) {
      // Create wallet if it doesn't exist
      const newWallet = await db.petalWallet.create({
        data: {
          userId,
          balance: localBalance,
          lifetimeEarned: localBalance,
          lastCollectedAt: new Date(),
        },
      });

      return NextResponse.json({
        ok: true,
        data: {
          syncedBalance: newWallet.balance,
          cloudBalance: newWallet.balance,
          localBalance,
          conflict: false,
        },
        requestId,
      });
    }

    // Conflict resolution: Use the higher balance (last-write-wins with merge)
    const cloudBalance = cloudWallet.balance;
    const syncedBalance = Math.max(cloudBalance, localBalance);

    // If cloud balance is higher, update local
    // If local balance is higher, update cloud
    if (syncedBalance !== cloudBalance) {
      await db.petalWallet.update({
        where: { userId },
        data: {
          balance: syncedBalance,
          // Only update lifetimeEarned if synced balance is higher
          lifetimeEarned: Math.max(cloudWallet.lifetimeEarned, syncedBalance),
        },
      });
    }

    // Merge transactions if provided
    if (localTransactions && localTransactions.length > 0) {
      // Check for duplicate transactions and merge
      for (const localTx of localTransactions) {
        const existingTx = await db.petalTransaction.findFirst({
          where: {
            userId,
            amount: localTx.amount,
            source: localTx.source,
            createdAt: new Date(localTx.timestamp),
          },
        });

        if (!existingTx) {
          // Create missing transaction
          await db.petalTransaction.create({
            data: {
              userId,
              amount: localTx.amount,
              source: localTx.source,
              description: `Synced transaction from device`,
            },
          });
        }
      }
    }

    return NextResponse.json({
      ok: true,
      data: {
        syncedBalance,
        cloudBalance,
        localBalance,
        conflict: syncedBalance !== localBalance && syncedBalance !== cloudBalance,
        lastSyncedAt: new Date().toISOString(),
      },
      requestId,
    });
  } catch (error: any) {
    console.error('[Petal Sync] Error:', error);
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
