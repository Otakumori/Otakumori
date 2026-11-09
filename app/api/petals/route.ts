import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { legacyRewardRouteDisabled } from '@/app/lib/petals/legacyRewardRoute';

async function getDb() {
  const { db } = await import('@/lib/db');
  return db;
}

export async function POST() {
  return legacyRewardRouteDisabled('/api/v1/petals/wallet');
}

export async function GET(request: NextRequest) {
  try {
    // Log petal balance request for analytics
    const { logger } = await import('@/app/lib/logger');
    logger.warn('Petal balance requested from:', undefined, {
      userAgent: request.headers.get('user-agent'),
    });

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        petalBalance: true,
        dailyClicks: true,
        lastClickDayUTC: true,
        level: true,
        xp: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get recent petal transactions
    const recentTransactions = await db.petalLedger.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get global petal statistics
    const globalStats = await db.petalLedger.aggregate({
      _sum: { amount: true },
      where: { type: 'earn' },
    });

    return NextResponse.json({
      data: {
        user: {
          petalBalance: user.petalBalance,
          dailyClicks: user.dailyClicks,
          lastClickDayUTC: user.lastClickDayUTC,
          level: user.level,
          xp: user.xp,
        },
        recentTransactions,
        globalStats: {
          totalPetalsEarned: globalStats._sum.amount || 0,
        },
      },
    });
  } catch (error) {
    const { logger } = await import('@/app/lib/logger');
    logger.error(
      'Error fetching petal data:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
