/**
 * Global Petal Leaderboard API
 *
 * Returns top users by lifetime petals earned
 * Public endpoint (read-only, no auth required)
 */

import { logger } from '@/app/lib/logger';
import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100); // Max 100

    // Get top users by lifetime petals from PetalWallet
    const topWallets = await db.petalWallet.findMany({
      where: {
        lifetimeEarned: {
          gt: 0, // Only users who have earned petals
        },
      },
      orderBy: {
        lifetimeEarned: 'desc',
      },
      take: limit,
      include: {
        User: {
          select: {
            id: true,
            clerkId: true,
            // Note: We don't have displayName/avatarUrl in User model yet
            // This can be extended later when those fields exist
          },
        },
      },
    });

    // Format response
    const leaderboard = topWallets.map((wallet, index) => ({
      rank: index + 1,
      userId: wallet.userId,
      clerkId: wallet.User?.clerkId || null,
      displayName: wallet.User?.clerkId || `User ${wallet.userId.slice(0, 8)}`, // Fallback display name
      avatarUrl: null, // Can be added when avatar system is integrated
      lifetimePetalsEarned: wallet.lifetimeEarned,
      currentBalance: wallet.balance,
    }));

    return NextResponse.json({
      ok: true,
      data: {
        leaderboard,
        total: leaderboard.length,
      },
    });
  } catch (error) {
    logger.error('Error fetching global petal leaderboard:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
