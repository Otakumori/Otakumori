/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { GameFinishRequestSchema } from '@/app/lib/contracts';
import { getGameDef } from '@/app/lib/games';

export const runtime = 'nodejs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = GameFinishRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ ok: false, error: 'Invalid request data' }, { status: 400 });
    }

    const { runId, score, statsHash, meta, idempotencyKey } = validationResult.data;

    // Check idempotency
    if (idempotencyKey) {
      const existingFinish = await prisma.idempotencyKey.findUnique({
        where: { key: idempotencyKey },
      });

      if (existingFinish) {
        return NextResponse.json({ ok: false, error: 'Duplicate finish request' }, { status: 409 });
      }
    }

    // Get the game run
    const gameRun = await prisma.gameRun.findUnique({
      where: { id: runId },
      include: { user: true },
    });

    if (!gameRun) {
      return NextResponse.json({ ok: false, error: 'Game run not found' }, { status: 404 });
    }

    // Verify ownership
    if (gameRun.userId !== userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 403 });
    }

    // Check if already finished
    if (gameRun.finishedAt) {
      return NextResponse.json({ ok: false, error: 'Game run already finished' }, { status: 409 });
    }

    // Validate run duration (anti-cheat)
    const runDuration = Date.now() - gameRun.startedAt.getTime();
    const minDuration = 5000; // 5 seconds minimum
    const maxDuration = 30 * 60 * 1000; // 30 minutes maximum

    if (runDuration < minDuration || runDuration > maxDuration) {
      return NextResponse.json({ ok: false, error: 'Invalid run duration' }, { status: 400 });
    }

    // Get game definition
    const gameDef = getGameDef(gameRun.gameKey);
    if (!gameDef) {
      return NextResponse.json({ ok: false, error: 'Game not found' }, { status: 404 });
    }

    // Validate score (anti-cheat)
    const maxScore = gameDef.maxRewardPerRun * 10; // Reasonable max score
    const clampedScore = Math.max(0, Math.min(score, maxScore));

    // Calculate reward petals
    const baseReward = Math.floor(clampedScore / 100) * 10; // 10 petals per 100 points
    const maxReward = gameDef.maxRewardPerRun;
    const rewardPetals = Math.min(baseReward, maxReward);

    // Check daily petal limit
    const dailyLimit = parseInt(process.env.NEXT_PUBLIC_DAILY_PETAL_LIMIT || '500');
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const todayRuns = await prisma.gameRun.aggregate({
      where: {
        userId,
        startedAt: {
          gte: today,
        },
      },
      _sum: {
        rewardPetals: true,
      },
    });

    const todayPetals = todayRuns._sum.rewardPetals || 0;
    const adjustedReward = Math.min(rewardPetals, dailyLimit - todayPetals);

    // Update game run
    const updatedRun = await prisma.gameRun.update({
      where: { id: runId },
      data: {
        score: clampedScore,
        rewardPetals: adjustedReward,
        finishedAt: new Date(),
        meta: {
          ...(gameRun.meta as any),
          finishMeta: meta,
          statsHash,
          runDuration,
          originalReward: rewardPetals,
          adjustedReward: adjustedReward,
        },
      },
    });

    // Update user's petal balance
    if (adjustedReward > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          petalBalance: {
            increment: adjustedReward,
          },
        },
      });

      // Record in petal ledger
      await prisma.petalLedger.create({
        data: {
          userId,
          type: 'earn',
          amount: adjustedReward,
          reason: `Game completion: ${gameDef.name}`,
        },
      });
    }

    // Check for achievements
    const achievements = await checkAchievements(userId, gameRun.gameKey, clampedScore, meta);

    // Grant gacha items for bubble-pop-gacha
    let itemsGranted: string[] = [];
    if (gameRun.gameKey === 'bubble-pop-gacha' && adjustedReward > 0) {
      itemsGranted = await grantGachaItems(userId, adjustedReward);
    }

    // Store idempotency key if provided
    if (idempotencyKey) {
      await prisma.idempotencyKey.create({
        data: {
          key: idempotencyKey,
          purpose: `game_finish_${runId}_${userId}`,
        },
      });
    }

    // Get updated balance
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { petalBalance: true, runes: true },
    });

    // Return success response
    const response = {
      ok: true,
      data: {
        petalsAwarded: adjustedReward,
        itemsGranted: itemsGranted.length > 0 ? itemsGranted : undefined,
        achievements: achievements.length > 0 ? achievements : undefined,
        balance: updatedUser?.petalBalance || 0,
        runeGrants: updatedUser?.runes || 0,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Game finish error:', error);

    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

async function checkAchievements(
  userId: string,
  gameKey: string,
  score: number,
  meta: any,
): Promise<string[]> {
  const unlockedAchievements: string[] = [];

  try {
    // Check for game-specific achievements
    if (gameKey === 'samurai-petal-slice') {
      const swings = meta?.swings || 0;
      const perfectArcs = meta?.perfectArcs || 0;
      const misses = meta?.misses || 0;
      const combo = meta?.longestCombo || 0;
      const timeToClear = meta?.timeToClear || 0;

      // Zen Is a Lie (50 swings in 10s)
      if (swings >= 50 && timeToClear <= 10000) {
        await unlockAchievement(userId, 'ZEN_IS_A_LIE', unlockedAchievements);
      }

      // I Have No Master (left-handed)
      if (meta?.leftHanded) {
        await unlockAchievement(userId, 'I_HAVE_NO_MASTER', unlockedAchievements);
      }

      // Sliced in Silence (muted, score 1000+)
      if (meta?.muted && score >= 1000) {
        await unlockAchievement(userId, 'SLICED_IN_SILENCE', unlockedAchievements);
      }

      // Don't Touch My Petals (miss 0)
      if (misses === 0 && score > 0) {
        await unlockAchievement(userId, 'DONT_TOUCH_MY_PETALS', unlockedAchievements);
      }

      // All Petal, No Metal (lose with 0 slashes)
      if (swings === 0 && score === 0) {
        await unlockAchievement(userId, 'ALL_PETAL_NO_METAL', unlockedAchievements);
      }
    }

    // Check for general achievements
    if (score >= 1000) {
      await unlockAchievement(userId, 'SCORE_MASTER', unlockedAchievements);
    }

    if (score >= 5000) {
      await unlockAchievement(userId, 'SCORE_LEGEND', unlockedAchievements);
    }
  } catch (error) {
    console.error('Achievement check error:', error);
  }

  return unlockedAchievements;
}

async function unlockAchievement(
  userId: string,
  achievementCode: string,
  unlockedList: string[],
): Promise<void> {
  try {
    // Check if already unlocked
    const existing = await prisma.userAchievement.findFirst({
      where: {
        userId,
        achievement: {
          code: achievementCode,
        },
      },
    });

    if (existing) return;

    // Get achievement
    const achievement = await prisma.achievement.findUnique({
      where: { code: achievementCode },
    });

    if (!achievement) return;

    // Unlock achievement
    await prisma.userAchievement.create({
      data: {
        userId,
        achievementId: achievement.id,
      },
    });

    unlockedList.push(achievementCode);

    // Grant reward if any
    if (achievement.rewardId) {
      await grantReward(userId, achievement.rewardId);
    }
  } catch (error) {
    console.error('Achievement unlock error:', error);
  }
}

async function grantReward(userId: string, rewardId: string): Promise<void> {
  try {
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
    });

    if (!reward) return;

    switch (reward.kind) {
      case 'PETALS_BONUS':
        if (reward.value) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              petalBalance: {
                increment: reward.value,
              },
            },
          });
        }
        break;

      case 'COSMETIC':
      case 'OVERLAY':
        if (reward.sku) {
          await prisma.inventoryItem.create({
            data: {
              userId,
              sku: reward.sku,
              kind: reward.kind,
              metadata: reward.metadata as any,
            },
          });
        }
        break;

      case 'COUPON_PERCENT':
      case 'COUPON_AMOUNT':
        const couponCode = `COUPON_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await prisma.couponGrant.create({
          data: {
            userId,
            code: couponCode,
            discountType: reward.kind === 'COUPON_PERCENT' ? 'PERCENT' : 'OFF_AMOUNT',
            percentOff: reward.kind === 'COUPON_PERCENT' ? reward.value : undefined,
            amountOff: reward.kind === 'COUPON_AMOUNT' ? reward.value : undefined,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        });
        break;

      case 'RUNE_GRANT':
        if (reward.value) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              runes: {
                increment: reward.value,
              },
            },
          });
        }
        break;
    }
  } catch (error) {
    console.error('Reward grant error:', error);
  }
}

async function grantGachaItems(userId: string, petalReward: number): Promise<string[]> {
  const grantedItems: string[] = [];

  try {
    // Simple gacha logic - higher petal rewards = better chances
    const rarity = petalReward >= 100 ? 'rare' : petalReward >= 50 ? 'uncommon' : 'common';

    // For now, just return placeholder items
    // In production, this would use a proper gacha table
    if (rarity === 'rare') {
      grantedItems.push('rare_cosmetic_001');
    } else if (rarity === 'uncommon') {
      grantedItems.push('uncommon_overlay_001');
    } else {
      grantedItems.push('common_badge_001');
    }

    // Add to inventory
    for (const itemSku of grantedItems) {
      await prisma.inventoryItem.create({
        data: {
          userId,
          sku: itemSku,
          kind: itemSku.includes('cosmetic') ? 'COSMETIC' : 'OVERLAY',
          metadata: { rarity, source: 'gacha' } as any,
        },
      });
    }
  } catch (error) {
    console.error('Gacha item grant error:', error);
  }

  return grantedItems;
}
