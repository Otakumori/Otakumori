// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const earnPetalsSchema = z.object({
  amount: z.number().int().positive(),
  reason: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, reason } = earnPetalsSchema.parse(body);

    // Check daily click limit
    const today = new Date().toISOString().split('T')[0];
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, dailyClicks: true, lastClickDayUTC: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Reset daily clicks if it's a new day
    let dailyClicks = user.dailyClicks;
    if (user.lastClickDayUTC.toISOString().split('T')[0] !== today) {
      dailyClicks = 0;
    }

    // Check if user has exceeded daily limit (assuming 100 clicks per day)
    if (dailyClicks >= 100) {
      return NextResponse.json({ error: 'Daily click limit reached' }, { status: 429 });
    }

    // Update user's petal balance and daily clicks
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        petalBalance: { increment: amount },
        dailyClicks: { increment: 1 },
        lastClickDayUTC: new Date(),
      },
    });

    // Record the transaction
    await db.petalLedger.create({
      data: {
        userId: user.id,
        type: 'earn',
        amount,
        reason,
      },
    });

    return NextResponse.json({
      data: {
        newBalance: updatedUser.petalBalance,
        dailyClicks: updatedUser.dailyClicks,
        message: `Earned ${amount} petals for ${reason}`,
      },
    });
  } catch (error) {
    console.error('Error earning petals:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        petalBalance: true,
        dailyClicks: true,
        lastClickDayUTC: true,
        level: true,
        xp: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get recent petal transactions
    const recentTransactions = await db.petalLedger.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get global petal statistics
    const globalStats = await db.petalLedger.aggregate({
      _sum: { amount: true },
      where: { type: 'earn' },
    });

    return NextResponse.json({
      data: {
        user: {
          petalBalance: user.petalBalance,
          dailyClicks: user.dailyClicks,
          lastClickDayUTC: user.lastClickDayUTC,
          level: user.level,
          xp: user.xp,
        },
        recentTransactions,
        globalStats: {
          totalPetalsEarned: globalStats._sum.amount || 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching petal data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
