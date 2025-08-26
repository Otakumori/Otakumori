/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
export const dynamic = "force-dynamic";      // tells Next this cannot be statically analyzed
export const runtime = "nodejs";              // keep on Node runtime (not edge)
export const preferredRegion = "iad1";        // optional: co-locate w/ your logs region
export const maxDuration = 10;                // optional guard

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { GetAchievementsResponseSchema } from '@/app/lib/contracts';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user
    const user = await db.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all achievements
    const allAchievements = await db.achievement.findMany({
      include: { reward: true },
      orderBy: { points: 'desc' }
    });

    // Get user's unlocked achievements
    const userAchievements = await db.userAchievement.findMany({
      where: { userId: user.id },
      include: { achievement: { include: { reward: true } } },
      orderBy: { createdAt: 'desc' }
    });

    // Create a map of unlocked achievement IDs for quick lookup
    const unlockedAchievementIds = new Set(
      userAchievements.map(ua => ua.achievementId)
    );

    // Transform achievements to include unlock status
    const transformedAchievements = allAchievements.map(achievement => {
      const isUnlocked = unlockedAchievementIds.has(achievement.id);
      const unlockedAt = isUnlocked ? 
        userAchievements.find(ua => ua.achievementId === achievement.id)?.createdAt.toISOString() : 
        undefined;

      return {
        id: achievement.id,
        code: achievement.code,
        name: achievement.name,
        description: achievement.description,
        points: achievement.points,
        isUnlocked,
        unlockedAt,
        reward: achievement.reward ? {
          kind: achievement.reward.kind,
          value: achievement.reward.value,
          sku: achievement.reward.sku
        } : null
      };
    });

    // Calculate user's achievement stats
    const unlockedCount = unlockedAchievementIds.size;
    const totalPoints = userAchievements.reduce((sum, ua) => sum + ua.achievement.points, 0);
    const completionPercentage = Math.round((unlockedCount / allAchievements.length) * 100);

    return NextResponse.json({
      ok: true,
      data: {
        achievements: transformedAchievements,
        stats: {
          unlocked: unlockedCount,
          total: allAchievements.length,
          points: totalPoints,
          completionPercentage
        }
      }
    });

  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
