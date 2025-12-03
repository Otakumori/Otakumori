import { logger } from '@/app/lib/logger';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

import { awardStreakShardIfEligible, userDayNY } from '@/app/lib/quests/server';
import { db } from '@/lib/db';
import { grantPetals } from '@/app/lib/petals/grant';
// import { redis } from "@/lib/redis"; // Disabled due to Redis config issues

const ClaimRequestSchema = z.object({
  assignmentId: z.string().min(1),
});

const DAILY_CAP = 120;
// TTL for Redis cap tracking (currently using database fallback)
// When Redis is re-enabled, use this TTL for caching daily caps
const CAP_TTL_SECONDS = 60 * 60 * 24 * 2; // 2 days

// Helper to generate cache key for daily cap tracking
const getDailyCapKey = (userId: string, date: string) =>
  `quest:daily_cap:${userId}:${date}:ttl_${CAP_TTL_SECONDS}`;

// Helper to check daily quest cap (to be used when Redis is enabled)
async function checkDailyQuestCap(userId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = getDailyCapKey(userId, today);
  // TODO: Implement Redis check when available
  // const count = await redis.get(cacheKey);
  // return count ? parseInt(count) < 10 : true;
  logger.warn('Daily quest cap check bypassed - Redis not configured', undefined, { cacheKey });
  return true; // Allow quests until Redis is configured
}

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'auth' }, { status: 401 });
    }

    // Check daily quest cap before processing
    const canClaim = await checkDailyQuestCap(clerkId);
    if (!canClaim) {
      return NextResponse.json({ error: 'daily_cap_reached' }, { status: 429 });
    }

    const body = ClaimRequestSchema.parse(await request.json());

    const assignment = await db.questAssignment.findUnique({
      where: { id: body.assignmentId },
      include: { Quest: true },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'notfound' }, { status: 404 });
    }

    const user = await db.user.findUnique({
      where: { clerkId },
      select: { id: true, petalBalance: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'notfound' }, { status: 404 });
    }

    if (assignment.userId !== user.id) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    if (!assignment.completedAt) {
      return NextResponse.json({ error: 'incomplete' }, { status: 400 });
    }

    if (assignment.claimedAt) {
      return NextResponse.json({ ok: true, already: true, message: 'Already claimed' });
    }

    const quest = assignment.Quest;
    if (!quest) {
      return NextResponse.json({ error: 'quest_not_found' }, { status: 404 });
    }

    const day = assignment.day ?? userDayNY();
    // Redis key for future cap tracking (currently using database fallback)
    const dailyCapKey = `petals:cap:${user.id}:${day}`;
    logger.warn(`Quest claim tracking key: ${dailyCapKey} (Redis disabled, using DB)`);

    let usedToday = 0;
    // Redis disabled due to config issues - using database fallback
    // try {
    //   const current = await redis.get<number>(dailyCapKey);
    //   if (typeof current === "number") {
    //     usedToday = current;
    //   }
    // } catch (error) {
    //   console.warn("Redis get failed", error);
    // }

    const baseReward = quest.basePetals ?? 0;
    const bonusReward = assignment.bonusEligible ? (quest.bonusPetals ?? 0) : 0;
    const totalReward = baseReward + bonusReward;

    const availableToday = Math.max(0, DAILY_CAP - usedToday);
    const actualReward = Math.min(totalReward, availableToday);

    // Mark quest as claimed
    await db.questAssignment.update({
      where: { id: assignment.id },
      data: { claimedAt: new Date() },
    });

    // Award petals using centralized grantPetals (tracks lifetimeEarned, enforces daily caps)
    let petalResult: Awaited<ReturnType<typeof grantPetals>> = {
      success: false,
      granted: 0,
      newBalance: user.petalBalance,
      lifetimeEarned: 0,
    };
    if (actualReward > 0) {
      petalResult = await grantPetals({
        userId: user.id,
        amount: actualReward,
        source: 'quest_reward',
        metadata: {
          questKey: quest.key,
          questTitle: quest.title,
          bonusEligible: assignment.bonusEligible,
        },
        description: `Quest reward: ${quest.key}`,
        req: request as any, // For rate limiting
      });
    }

    if (actualReward > 0) {
      // Redis disabled due to config issues - using database fallback
      // try {
      //   await redis.set(dailyCapKey, usedToday + actualReward, {
      //     ex: CAP_TTL_SECONDS,
      //   });
      // } catch (error) {
      //   console.warn("Redis set failed", error);
      // }
    }

    const streakShardAwarded = await awardStreakShardIfEligible(user.id, day);

    return NextResponse.json({
      ok: true,
      petalsGranted: petalResult.success ? petalResult.granted : actualReward,
      totalReward,
      capped: actualReward < totalReward || petalResult.limited || false,
      dailyCapUsed: usedToday + actualReward,
      dailyCapRemaining:
        petalResult.dailyRemaining ?? Math.max(0, DAILY_CAP - (usedToday + actualReward)),
      streakShardAwarded,
      newBalance: petalResult.newBalance,
      lifetimePetalsEarned: petalResult.lifetimeEarned,
      quest: {
        key: quest.key,
        title: quest.title,
        basePetals: quest.basePetals,
        bonusPetals: quest.bonusPetals,
        bonusEligible: assignment.bonusEligible,
      },
    });
  } catch (error) {
    logger.error(
      'Quest claim error',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
