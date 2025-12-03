import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { generateRequestId } from '@/lib/requestId';
import { PETAL_REWARDS } from '@/app/lib/petal-economy';
import { z } from 'zod';

export const runtime = 'nodejs';

const ClaimRewardSchema = z.object({
  threshold: z.number(),
});

/**
 * Claim a petal reward when user reaches a threshold
 * Creates a discount code or unlocks content based on reward type
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
    const { threshold } = ClaimRewardSchema.parse(body);

    // Find the reward
    const reward = PETAL_REWARDS.find((r) => r.threshold === threshold);
    if (!reward) {
      return NextResponse.json({ ok: false, error: 'INVALID_REWARD', requestId }, { status: 400 });
    }

    // Get user's petal balance
    const wallet = await db.petalWallet.findUnique({
      where: { userId },
    });

    if (!wallet || wallet.balance < threshold) {
      return NextResponse.json(
        { ok: false, error: 'INSUFFICIENT_PETALS', requestId },
        { status: 400 },
      );
    }

    // Check if reward already claimed
    const existingClaim = await db.couponGrant.findFirst({
      where: {
        userId,
        discountRewardId: reward.rewardId || undefined,
      },
    });

    if (existingClaim && reward.type === 'discount') {
      return NextResponse.json(
        { ok: false, error: 'REWARD_ALREADY_CLAIMED', requestId },
        { status: 400 },
      );
    }

    // Process reward based on type
    let result: {
      type: string;
      value: string | number;
      code?: string;
    };

    switch (reward.type) {
      case 'discount': {
        // Create discount reward in database if it doesn't exist
        let discountReward = await db.discountReward.findFirst({
          where: {
            petalCost: threshold,
            discountType: 'PERCENT',
            percentOff: reward.value as number,
          },
        });

        if (!discountReward) {
          discountReward = await db.discountReward.create({
            data: {
              name: `${reward.value}% Petal Discount`,
              description: reward.description,
              discountType: 'PERCENT',
              percentOff: reward.value as number,
              petalCost: threshold,
              enabled: true,
              validityDays: 30,
            },
          });
        }

        // Generate coupon code
        const couponCode = `PETAL${threshold}-${userId.slice(0, 8).toUpperCase()}`;

        // Grant coupon to user
        await db.couponGrant.create({
          data: {
            userId,
            code: couponCode,
            discountType: 'PERCENT',
            percentOff: reward.value as number,
            petalCost: threshold,
            discountRewardId: discountReward.id,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        });

        result = {
          type: 'discount',
          value: reward.value,
          code: couponCode,
        };
        break;
      }

      case 'unlock':
      case 'exclusive':
      case 'badge': {
        // For unlock/exclusive/badge types, we could create an achievement or inventory item
        // For now, just return success
        result = {
          type: reward.type,
          value: reward.value,
        };
        break;
      }

      default:
        return NextResponse.json(
          { ok: false, error: 'INVALID_REWARD_TYPE', requestId },
          { status: 400 },
        );
    }

    return NextResponse.json(
      {
        ok: true,
        data: {
          reward: {
            threshold: reward.threshold,
            description: reward.description,
            ...result,
          },
        },
        requestId,
      },
      { status: 200 },
    );
  } catch (error: any) {
    logger.error('[Claim Petal Reward] Error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
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
