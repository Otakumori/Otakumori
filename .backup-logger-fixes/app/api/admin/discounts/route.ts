import { logger } from '@/app/lib/logger';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { z } from 'zod';
import { requireAdmin } from '@/app/lib/authz';

export const runtime = 'nodejs';

const DiscountRewardSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  discountType: z.enum(['PERCENT', 'OFF_AMOUNT']),
  amountOff: z.number().int().positive().optional().nullable(),
  percentOff: z.number().int().min(0).max(100).optional().nullable(),
  petalCost: z.number().int().positive(),
  nsfwOnly: z.boolean().default(false),
  requiresAchievementId: z.string().optional().nullable(),
  minSpendCents: z.number().int().nonnegative().optional().nullable(),
  maxUsesPerUser: z.number().int().positive().optional().nullable(),
  maxTotalUses: z.number().int().positive().optional().nullable(),
  validityDays: z.number().int().positive().default(30),
  enabled: z.boolean().default(true),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
});

// GET - List all discount rewards
export async function GET() {
  try {
    await requireAdmin();

    const rewards = await db.discountReward.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            CouponGrant: true,
          },
        },
      },
    });

    // Get usage stats for each reward
    const rewardsWithStats = await Promise.all(
      rewards.map(async (reward: (typeof rewards)[0]) => {
        const totalPurchased = await db.couponGrant.count({
          where: { discountRewardId: reward.id },
        });

        const totalRedeemed = await db.couponGrant.count({
          where: {
            discountRewardId: reward.id,
            redeemedAt: { not: null },
          },
        });

        return {
          ...reward,
          stats: {
            totalPurchased,
            totalRedeemed,
            activeCount: totalPurchased - totalRedeemed,
          },
        };
      }),
    );

    return NextResponse.json({
      ok: true,
      data: { rewards: rewardsWithStats },
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
    }
    logger.error('Error fetching discount rewards:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create or update discount reward
export async function POST(req: Request) {
  try {
    await requireAdmin();

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = DiscountRewardSchema.parse(body);

    // Validate discount type matches amount fields
    if (validated.discountType === 'PERCENT' && !validated.percentOff) {
      return NextResponse.json(
        { ok: false, error: 'PERCENT discount requires percentOff' },
        { status: 400 },
      );
    }
    if (validated.discountType === 'OFF_AMOUNT' && !validated.amountOff) {
      return NextResponse.json(
        { ok: false, error: 'OFF_AMOUNT discount requires amountOff' },
        { status: 400 },
      );
    }

    const data = {
      name: validated.name,
      description: validated.description,
      discountType: validated.discountType,
      amountOff: validated.amountOff,
      percentOff: validated.percentOff,
      petalCost: validated.petalCost,
      nsfwOnly: validated.nsfwOnly,
      requiresAchievementId: validated.requiresAchievementId,
      minSpendCents: validated.minSpendCents,
      maxUsesPerUser: validated.maxUsesPerUser,
      maxTotalUses: validated.maxTotalUses,
      validityDays: validated.validityDays,
      enabled: validated.enabled,
      startsAt: validated.startsAt ? new Date(validated.startsAt) : null,
      endsAt: validated.endsAt ? new Date(validated.endsAt) : null,
      createdBy: user.id,
    };

    let reward;
    if (validated.id) {
      // Update existing
      reward = await db.discountReward.update({
        where: { id: validated.id },
        data,
      });
    } else {
      // Create new
      reward = await db.discountReward.create({
        data,
      });
    }

    return NextResponse.json({
      ok: true,
      data: { reward },
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }
    logger.error('Error saving discount reward:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Archive/disable discount reward
export async function DELETE(req: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });
    }

    // Soft delete by disabling
    await db.discountReward.update({
      where: { id },
      data: { enabled: false },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
    }
    logger.error('Error deleting discount reward:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
