// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

async function getDb() {
  const { db } = await import('@/lib/db');
  return db;
}

export const runtime = 'nodejs';

const UnlockRequestSchema = z.object({
  achievementCode: z.string().min(1),
  idempotencyKey: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request
    const body = await request.json();
    const validatedData = UnlockRequestSchema.parse(body);

    // Get database connection
    const db = await getDb();

    // Check idempotency
    const existingKey = await db.idempotencyKey.findUnique({
      where: { key: validatedData.idempotencyKey },
    });

    if (existingKey) {
      return NextResponse.json({ ok: false, error: 'Duplicate request' }, { status: 409 });
    }

    // Create idempotency key
    await db.idempotencyKey.create({
      data: {
        key: validatedData.idempotencyKey,
        purpose: 'achievement_unlock',
      },
    });

    // Get user
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { UserAchievement: { include: { Achievement: { include: { Reward: true } } } } },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // Check if achievement already unlocked
    const alreadyUnlocked = user.UserAchievement.some(
      (ua) => ua.Achievement.code === validatedData.achievementCode,
    );

    if (alreadyUnlocked) {
      return NextResponse.json(
        { ok: false, error: 'Achievement already unlocked' },
        { status: 400 },
      );
    }

    // Get achievement details
    const achievement = await db.achievement.findUnique({
      where: { code: validatedData.achievementCode },
      include: { Reward: true },
    });

    if (!achievement) {
      return NextResponse.json({ ok: false, error: 'Achievement not found' }, { status: 404 });
    }

    // Unlock achievement
    const userAchievement = await db.userAchievement.create({
      data: {
        userId: user.id,
        achievementId: achievement.id,
      },
    });

    // Grant rewards
    let rewardGranted = false;
    let rewardDetails = null;

    if (achievement.Reward) {
      rewardGranted = true;

      switch (achievement.Reward.kind) {
        case 'PETALS_BONUS':
          const petalAmount = achievement.Reward.value || 0;
          
          // Use PetalService for consistent lifetime tracking and daily limits
          const { PetalService } = await import('@/app/lib/petals');
          const petalService = new PetalService();
          const petalResult = await petalService.awardPetals(user.id, {
            type: 'earn',
            amount: petalAmount,
            reason: `Achievement: ${achievement.name}`,
            source: 'achievement',
            metadata: {
              achievementCode: achievement.code,
              achievementId: achievement.id,
            },
          });

          if (!petalResult.success) {
            // Log but don't fail the achievement unlock
            console.error('Failed to award achievement petals:', petalResult.error);
          }

          rewardDetails = {
            type: 'petals',
            amount: petalResult.awarded || petalAmount,
            balance: petalResult.newBalance || 0,
            lifetimePetalsEarned: petalResult.lifetimePetalsEarned || 0,
            dailyCapReached: petalResult.dailyCapReached || false,
          };
          break;

        case 'COSMETIC':
        case 'OVERLAY':
          await db.inventoryItem.create({
            data: {
              userId: user.id,
              sku: achievement.Reward.sku || `achievement_${achievement.code}`,
              kind: achievement.Reward.kind === 'COSMETIC' ? 'COSMETIC' : 'OVERLAY',
              metadata: { source: 'achievement', achievementCode: achievement.code },
            },
          });

          rewardDetails = { type: 'item', sku: achievement.Reward.sku };
          break;

        case 'COUPON_PERCENT':
        case 'COUPON_AMOUNT':
          const couponCode = `ACH_${achievement.code}_${Date.now()}`;
          const isPercent = achievement.Reward.kind === 'COUPON_PERCENT';
          const couponData: any = {
            userId: user.id,
            code: couponCode,
            discountType: isPercent ? 'PERCENT' : 'OFF_AMOUNT',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          };
          if (
            isPercent &&
            achievement.Reward.value !== null &&
            achievement.Reward.value !== undefined
          ) {
            couponData.percentOff = achievement.Reward.value as number;
          }
          if (
            !isPercent &&
            achievement.Reward.value !== null &&
            achievement.Reward.value !== undefined
          ) {
            couponData.amountOff = achievement.Reward.value as number;
          }
          await db.couponGrant.create({ data: couponData });

          rewardDetails = { type: 'coupon', code: couponCode };
          break;
      }
    }

    return NextResponse.json({
      ok: true,
      data: {
        achievementId: userAchievement.id,
        rewardGranted,
        rewardDetails,
      },
    });
  } catch (error) {
    console.error('Error unlocking achievement:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: 'Invalid request data' }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
