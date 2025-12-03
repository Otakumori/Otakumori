/**
 * API to fetch available discount rewards for petal shop
 * Returns enabled DiscountReward templates that users can purchase
 */

import { logger } from '@/app/lib/logger';
import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { getPolicyFromRequest } from '@/app/lib/policy/fromRequest';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    // Get NSFW policy
    const policy = getPolicyFromRequest(req);
    const nsfwAllowed = policy.nsfwAllowed;

    const now = new Date();

    // Get enabled discount rewards that are currently available
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

    // Filter NSFW rewards based on policy
    const filteredRewards = rewards.filter((reward) => {
      if (reward.nsfwOnly && !nsfwAllowed) {
        return false;
      }
      return true;
    });

    // Check if user has required achievements (if userId provided)
    const availableRewards = userId
      ? await Promise.all(
          filteredRewards.map(async (reward) => {
            if (!reward.requiresAchievementId) {
              return { ...reward, available: true };
            }

            // Check if user has the required achievement
            const user = await db.user.findUnique({
              where: { clerkId: userId },
              select: { id: true },
            });

            if (!user) {
              return { ...reward, available: false };
            }

            const hasAchievement = await db.userAchievement.findFirst({
              where: {
                userId: user.id,
                Achievement: {
                  code: reward.requiresAchievementId,
                },
              },
            });

            return { ...reward, available: !!hasAchievement };
          }),
        )
      : filteredRewards.map((r) => ({ ...r, available: false }));

    return NextResponse.json({
      ok: true,
      data: {
        rewards: availableRewards.map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          discountType: r.discountType,
          amountOff: r.amountOff,
          percentOff: r.percentOff,
          petalCost: r.petalCost,
          nsfwOnly: r.nsfwOnly,
          minSpendCents: r.minSpendCents,
          validityDays: r.validityDays,
          available: 'available' in r ? r.available : true,
        })),
      },
    });
  } catch (error) {
    logger.error('Error fetching discount rewards:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
