/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

// GET: Fetch dashboard statistics
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    // TODO: Add admin role check
    // const user = await db.user.findUnique({ where: { clerkId: userId } });
    // if (!user?.isAdmin) { return NextResponse.json({ ok: false, error: 'Admin access required' }, { status: 403 }); }

    // Fetch statistics in parallel
    const [totalUsers, totalPetals, totalOrders, totalRunes, activeCombos, recentActivity] =
      await Promise.all([
        // Total users
        db.user.count(),

        // Total petals across all users
        db.user.aggregate({
          _sum: { petalBalance: true },
        }),

        // Total orders
        db.order.count({
          where: { status: 'pending' },
        }),

        // Total runes
        db.runeDef.count({
          where: { isActive: true },
        }),

        // Active combos
        db.runeCombo.count({
          where: { isActive: true },
        }),

        // Recent activity (last 10 events)
        db.petalLedger.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { username: true, display_name: true },
            },
          },
        }),
      ]);

    // Format recent activity
    const formattedActivity = recentActivity.map(event => ({
      id: event.id,
      type: event.type,
      description: `${event.user?.username || 'User'} ${event.type === 'earn' ? 'earned' : 'spent'} ${event.amount} petals`,
      timestamp: event.createdAt,
    }));

    const stats = {
      totalUsers,
      totalPetals: totalPetals._sum.petalBalance || 0,
      totalOrders,
      totalRunes,
      activeCombos,
      recentActivity: formattedActivity,
    };

    return NextResponse.json({
      ok: true,
      data: { stats },
    });
  } catch (error) {
    console.error('Dashboard stats fetch error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
