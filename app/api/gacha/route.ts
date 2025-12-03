
import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

async function getDb() {
  const { db } = await import('@/lib/db');
  return db;
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Log request for analytics
    logger.warn('Gacha pull requested from:', undefined, {
      userAgent: request.headers.get('user-agent'),
    });

    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body (even if empty, validates content-type)
    await request.json().catch(() => ({}));

    // Get user
    const db = await getDb();
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // Simple gacha system - random rewards
    const rewards = [
      { type: 'petals', amount: 10, rarity: 'common' },
      { type: 'petals', amount: 25, rarity: 'uncommon' },
      { type: 'petals', amount: 50, rarity: 'rare' },
      { type: 'petals', amount: 100, rarity: 'epic' },
      { type: 'petals', amount: 250, rarity: 'legendary' },
      { type: 'achievement', name: 'Lucky Draw Master', rarity: 'rare' },
      { type: 'achievement', name: 'Gacha Addict', rarity: 'epic' },
    ];

    // Random selection with weighted rarity
    const random = Math.random();
    let selectedReward;

    if (random < 0.6) {
      // 60% chance for common
      selectedReward = rewards.find((r) => r.rarity === 'common');
    } else if (random < 0.85) {
      // 25% chance for uncommon
      selectedReward = rewards.find((r) => r.rarity === 'uncommon');
    } else if (random < 0.95) {
      // 10% chance for rare
      selectedReward = rewards.find((r) => r.rarity === 'rare');
    } else if (random < 0.99) {
      // 4% chance for epic
      selectedReward = rewards.find((r) => r.rarity === 'epic');
    } else {
      // 1% chance for legendary
      selectedReward = rewards.find((r) => r.rarity === 'legendary');
    }

    if (!selectedReward) {
      selectedReward = rewards[0]; // Fallback to common
    }

    // Ensure we have a valid reward
    if (!selectedReward) {
      return NextResponse.json({ ok: false, error: 'Failed to select reward' }, { status: 500 });
    }

    const reward = selectedReward;

    // Record the gacha pull using existing models
    if (reward.type === 'petals' && reward.amount) {
      // Record petal reward in PetalLedger
      await db.petalLedger.create({
        data: {
          userId: user.id,
          type: 'earn',
          amount: reward.amount,
          reason: `Gacha pull - ${reward.rarity} reward`,
        },
      });

      // Update user's petal balance
      await db.user.update({
        where: { id: user.id },
        data: {
          petalBalance: {
            increment: reward.amount,
          },
        },
      });
    } else if (reward.type === 'achievement' && reward.name) {
      // Check if achievement exists, create if not
      let achievement = await db.achievement.findFirst({
        where: { name: reward.name },
      });

      if (!achievement) {
        achievement = await db.achievement.create({
          data: {
            code: `gacha_${reward.name.toLowerCase().replace(/\s+/g, '_')}`,
            name: reward.name,
            description: `Earned from gacha pull`,
            points: reward.rarity === 'rare' ? 50 : 100,
          },
        });
      }

      // Grant achievement to user
      await db.userAchievement.create({
        data: {
          userId: user.id,
          achievementId: achievement.id,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      data: {
        reward,
        message: `You got ${reward.amount || reward.name}!`,
        rarity: reward.rarity,
      },
    });
  } catch (error) {
    logger.error(
      'Error in gacha:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
