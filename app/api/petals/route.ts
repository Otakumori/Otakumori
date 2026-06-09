
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { grantPetals } from '@/app/lib/petals/grant';
import { resolveClickReward } from '@/app/lib/petals/serverRewards';

async function getDb() {
  const { db } = await import('@/lib/db');
  return db;
}

// The client may signal *which* action occurred, but never how many petals it
// is worth. The reward is derived server-side via resolveClickReward and the
// grant is funneled through grantPetals() (per-source caps + rate limits).
const earnPetalsSchema = z.object({
  reason: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { reason } = earnPetalsSchema.parse(body);

    // Server-owned reward — client-supplied amounts are ignored.
    const { amount, source } = resolveClickReward(reason);

    const result = await grantPetals({
      userId,
      amount,
      source,
      description: `Petal click (${reason})`,
      req: request,
    });

    if (!result.success) {
      const status =
        result.errorCode === 'RATE_LIMITED'
          ? 429
          : result.errorCode === 'AUTH_REQUIRED'
            ? 401
            : result.errorCode === 'VALIDATION_ERROR'
              ? 400
              : 500;
      return NextResponse.json({ error: result.error ?? 'Failed to earn petals' }, { status });
    }

    return NextResponse.json({
      data: {
        newBalance: result.newBalance,
        earned: result.granted,
        limited: result.limited ?? false,
        message: `Earned ${result.granted} petals for ${reason}`,
      },
    });
  } catch (error) {
    const { logger } = await import('@/app/lib/logger');
    logger.error(
      'Error earning petals:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
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
