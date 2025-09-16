// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { AchievementUnlockRequestSchema } from '@/app/lib/contracts';

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
      data: { key: validatedData.idempotencyKey, purpose: 'achievement_unlock' },
    });

    // Get user
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { achievements: { include: { achievement: true } } },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // Check if achievement already unlocked
    const alreadyUnlocked = user.achievements.some(
      (ua) => ua.achievement.code === validatedData.achievementCode,
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
      include: { reward: true },
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

    if (achievement.reward) {
      rewardGranted = true;

      switch (achievement.reward.kind) {
        case 'PETALS_BONUS':
          const petalAmount = achievement.reward.value || 0;
          await db.petalLedger.create({
            data: {
              userId: user.id,
              type: 'earn',
              amount: petalAmount,
              reason: `Achievement: ${achievement.name}`,
            },
          });

          // Update user balance
          await db.user.update({
            where: { id: user.id },
            data: { petalBalance: { increment: petalAmount } },
          });

          rewardDetails = { type: 'petals', amount: petalAmount };
          break;

        case 'COSMETIC':
        case 'OVERLAY':
          await db.inventoryItem.create({
            data: {
              userId: user.id,
              sku: achievement.reward.sku || `achievement_${achievement.code}`,
              kind: achievement.reward.kind === 'COSMETIC' ? 'COSMETIC' : 'OVERLAY',
              metadata: { source: 'achievement', achievementCode: achievement.code },
            },
          });

          rewardDetails = { type: 'item', sku: achievement.reward.sku };
          break;

        case 'COUPON_PERCENT':
        case 'COUPON_AMOUNT':
          const couponCode = `ACH_${achievement.code}_${Date.now()}`;
          await db.couponGrant.create({
            data: {
              userId: user.id,
              code: couponCode,
              discountType: achievement.reward.kind === 'COUPON_PERCENT' ? 'PERCENT' : 'OFF_AMOUNT',
              percentOff:
                achievement.reward.kind === 'COUPON_PERCENT' ? achievement.reward.value : undefined,
              amountOff:
                achievement.reward.kind === 'COUPON_AMOUNT' ? achievement.reward.value : undefined,
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            },
          });

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
