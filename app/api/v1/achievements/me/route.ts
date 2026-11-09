import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { logger } from '@/app/lib/logger';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    const [achievements, earned] = await Promise.all([
      db.achievement.findMany({ orderBy: [{ points: 'desc' }, { name: 'asc' }] }),
      db.userAchievement.findMany({
        where: { userId: user.id },
        select: { achievementId: true, createdAt: true },
      }),
    ]);
    const earnedByAchievementId = new Map(
      earned.map((record) => [record.achievementId, record.createdAt]),
    );

    return NextResponse.json({
      ok: true,
      data: {
        achievements: achievements.map((achievement) => {
          const unlockedAt = earnedByAchievementId.get(achievement.id);
          return {
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            icon: '',
            rarity: 'common' as const,
            unlocked: Boolean(unlockedAt),
            ...(unlockedAt ? { unlockedAt: unlockedAt.toISOString() } : {}),
          };
        }),
        total: achievements.length,
      },
    });
  } catch (error) {
    logger.error(
      'Failed to load achievements',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
