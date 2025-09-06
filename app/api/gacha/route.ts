// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
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

    // Record the gacha pull using existing models
    if (selectedReward.type === 'petals' && selectedReward.amount) {
      // Record petal reward in PetalLedger
      await db.petalLedger.create({
        data: {
          userId: user.id,
          type: 'earn',
          amount: selectedReward.amount,
          reason: `Gacha pull - ${selectedReward.rarity} reward`,
        },
      });

      // Update user's petal balance
      await db.user.update({
        where: { id: user.id },
        data: {
          petalBalance: {
            increment: selectedReward.amount,
          },
        },
      });
    } else if (selectedReward.type === 'achievement' && selectedReward.name) {
      // Check if achievement exists, create if not
      let achievement = await db.achievement.findFirst({
        where: { name: selectedReward.name },
      });

      if (!achievement) {
        achievement = await db.achievement.create({
          data: {
            code: `gacha_${selectedReward.name?.toLowerCase().replace(/\s+/g, '_')}`,
            name: selectedReward.name,
            description: `Earned from gacha pull`,
            points: selectedReward.rarity === 'rare' ? 50 : 100,
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
        reward: selectedReward,
        message: `You got ${selectedReward.amount || selectedReward.name}!`,
        rarity: selectedReward.rarity,
      },
    });
  } catch (error) {
    console.error('Error in gacha:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
