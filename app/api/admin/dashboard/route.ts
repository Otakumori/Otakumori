
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

import { logger } from '@/app/lib/logger';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authorizeAdminApi } from '@/app/lib/auth/admin';

// GET: Fetch dashboard statistics
export async function GET() {
  const authorization = await authorizeAdminApi();
  if (!authorization.ok) return authorization.response;

  try {
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
            User: {
              select: { username: true, displayName: true },
            },
          },
        }),
      ]);

    // Format recent activity
    const formattedActivity = recentActivity.map((event) => ({
      id: event.id,
      type: event.type,
      description: `${event.User?.username || 'User'} ${event.type === 'earn' ? 'earned' : 'spent'} ${event.amount} petals`,
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
    logger.error('Dashboard error', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}
