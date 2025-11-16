/**
 * Petal Summary API - Returns comprehensive petal stats for profile view
 * 
 * Returns:
 * - Current balance
 * - Lifetime petals earned
 * - Today's earnings
 * - Daily cap status
 * - Achievement summary (count, petals from achievements)
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { PetalService } from '@/app/lib/petals';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    // Get user
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'User not found' },
        { status: 404 },
      );
    }

    // Get petal info via PetalService
    const petalService = new PetalService();
    const petalInfoResult = await petalService.getUserPetalInfo(user.id);

    if (!petalInfoResult.success || !petalInfoResult.data) {
      return NextResponse.json(
        { ok: false, error: petalInfoResult.error || 'Failed to fetch petal info' },
        { status: 500 },
      );
    }

    const petalInfo = petalInfoResult.data;

    // Calculate today's earnings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayEarnings = await db.petalLedger.aggregate({
      where: {
        userId: user.id,
        type: 'earn',
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const todayEarned = todayEarnings._sum.amount || 0;

    // Get achievement count and total petals from achievements
    const achievements = await db.userAchievement.findMany({
      where: { userId: user.id },
      include: {
        Achievement: {
          include: {
            Reward: true,
          },
        },
      },
    });

    const achievementCount = achievements.length;
    
    // Calculate total petals earned from achievements
    let achievementPetals = 0;
    const achievementEarnings = await db.petalLedger.findMany({
      where: {
        userId: user.id,
        type: 'earn',
        reason: {
          startsWith: 'Achievement:',
        },
      },
      select: {
        amount: true,
      },
    });

    achievementPetals = achievementEarnings.reduce((sum, entry) => sum + entry.amount, 0);

    // Check daily cap status (simplified - check if today's earnings exceed any limit)
    const dailyLimits = {
      game: 2000,
      achievement: 3000,
      daily_bonus: 100,
      purchase_bonus: 5000,
      other: 500,
    };

    // Get today's earnings by source type
    const todayBySource = await db.petalLedger.groupBy({
      by: ['reason'],
      where: {
        userId: user.id,
        type: 'earn',
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Determine if daily cap is reached (simplified check)
    let dailyCapReached = false;
    for (const group of todayBySource) {
      const amount = group._sum.amount || 0;
      // Check against "other" limit for non-game/achievement sources
      if (amount >= dailyLimits.other) {
        dailyCapReached = true;
        break;
      }
    }

    return NextResponse.json({
      ok: true,
      data: {
        balance: petalInfo.balance,
        lifetimePetalsEarned: petalInfo.lifetimePetalsEarned,
        todayEarned,
        dailyCapReached,
        achievements: {
          count: achievementCount,
          petalsEarned: achievementPetals,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching petal summary:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

