import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { generateRequestId } from '@/lib/requestId';
import type { UserBehaviorProfile } from '@/app/lib/recommendations';

export const runtime = 'nodejs';

/**
 * Get user behavior profile for recommendations
 */
export async function GET(_req: NextRequest) {
  const requestId = generateRequestId();

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'AUTH_REQUIRED', requestId },
        { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } },
      );
    }

    // Get user's petal wallet for collection pattern
    const wallet = await db.petalWallet.findUnique({
      where: { userId },
    });

    // Get user's game runs
    const gameRuns = await db.gameRun.findMany({
      where: { userId },
      select: { gameKey: true },
      take: 50,
    });

    // Get user's orders (for product preferences)
    const orders = await db.order.findMany({
      where: { userId },
      select: { OrderItem: { select: { productId: true } } },
      take: 20,
    });

    // Build behavior profile
    const totalPetals = wallet?.balance || 0;
    const petalCollectionPattern: UserBehaviorProfile['petalCollectionPattern'] =
      totalPetals > 1000 ? 'competitive' : totalPetals > 500 ? 'dedicated' : 'casual';

    const gamesPlayed = Array.from(new Set(gameRuns.map((r) => r.gameKey)));
    const productsViewed = Array.from(
      new Set(orders.flatMap((o) => o.OrderItem.map((item) => item.productId)))
    );

    const profile: UserBehaviorProfile = {
      favoriteGameGenres: [], // Could be derived from game metadata
      preferredProductCategories: [], // Could be derived from product categories
      readingInterests: [], // Could track blog post tags
      petalCollectionPattern,
      visitFrequency: 'weekly', // Could track visit frequency
      totalPetals,
      gamesPlayed,
      productsViewed,
      postsRead: [], // Could track read blog posts
    };

    return NextResponse.json({
      ok: true,
      data: { profile },
      requestId,
    });
  } catch (error: any) {
    console.error('[Recommendations] Error:', error);
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

