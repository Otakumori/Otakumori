import { logger } from '@/app/lib/logger';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { getPolicyFromRequest } from '@/app/lib/policy/fromRequest';

export const runtime = 'nodejs';

/**
 * GET - Fetch available discount rewards for petal shop
 * Filters by NSFW preference and achievement requirements
 */
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    const policy = getPolicyFromRequest(req);

    // Get user if authenticated
    let user = null;
    let userAchievementIds: string[] = [];
    if (userId) {
      user = await db.user.findUnique({
        where: { clerkId: userId },
        select: { id: true },
      });

      if (user) {
        const achievements = await db.userAchievement.findMany({
          where: { userId: user.id },
          select: { achievementId: true },
        });
        userAchievementIds = achievements.map((a) => a.achievementId);
      }
    }

    const now = new Date();

    // Get enabled discount rewards
    const rewards = await db.discountReward.findMany({
      where: {
        enabled: true,
        AND: [
          {
            OR: [{ startsAt: null }, { startsAt: { lte: now } }],
          },
          {
            OR: [{ endsAt: null }, { endsAt: { gte: now } }],
          },
        ],
      },
      orderBy: { petalCost: 'asc' },
    });

    // Filter rewards based on user eligibility
    const eligibleRewards = await Promise.all(
      rewards.map(async (reward) => {
        // Check NSFW requirement
        if (reward.nsfwOnly && !policy.nsfwAllowed) {
          return null;
        }

        // Check achievement requirement
        if (
          reward.requiresAchievementId &&
          !userAchievementIds.includes(reward.requiresAchievementId)
        ) {
          return null;
        }

        // Check usage limits if user is authenticated
        if (user) {
          // Check max uses per user
          if (reward.maxUsesPerUser) {
            const userPurchases = await db.couponGrant.count({
              where: {
                userId: user.id,
                discountRewardId: reward.id,
              },
            });
            if (userPurchases >= reward.maxUsesPerUser) {
              return null;
            }
          }

          // Check max total uses
          if (reward.maxTotalUses) {
            const totalPurchases = await db.couponGrant.count({
              where: {
                discountRewardId: reward.id,
              },
            });
            if (totalPurchases >= reward.maxTotalUses) {
              return null;
            }
          }
        }

        return reward;
      }),
    );

    const filteredRewards = eligibleRewards.filter((r): r is NonNullable<typeof r> => r !== null);

    return NextResponse.json({
      ok: true,
      data: {
        rewards: filteredRewards.map((reward) => ({
          id: reward.id,
          name: reward.name,
          description: reward.description,
          discountType: reward.discountType,
          amountOff: reward.amountOff,
          percentOff: reward.percentOff,
          petalCost: reward.petalCost,
          nsfwOnly: reward.nsfwOnly,
          minSpendCents: reward.minSpendCents,
          validityDays: reward.validityDays,
        })),
      },
    });
  } catch (error) {
    logger.error('Error fetching discount rewards:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
