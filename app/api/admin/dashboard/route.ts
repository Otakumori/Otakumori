export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

import { logger } from '@/app/lib/logger';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/app/lib/auth/admin';
import { loadFinanceReport } from '@/lib/finance/reporting';
import { buildAdminAttention } from '@/lib/admin/operations';

// GET: Fetch dashboard statistics
export async function GET() {
  try {
    await requireAdmin();
    const now = new Date();
    const financePeriod = {
      from: new Date(Date.UTC(now.getUTCFullYear(), 0, 1)),
      to: new Date(Date.UTC(now.getUTCFullYear(), 11, 31, 23, 59, 59, 999)),
      label: String(now.getUTCFullYear()),
    };

    // Fetch statistics in parallel
    const [
      totalUsers,
      totalPetals,
      totalOrders,
      totalRunes,
      activeCombos,
      recentActivity,
      finance,
    ] = await Promise.all([
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
      loadFinanceReport(financePeriod),
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
      attention: buildAdminAttention({
        orders: finance.orders,
        reconciliation: finance.reconciliation,
        closeBlockers: finance.close.blockers,
        taxReadiness: finance.tax.readiness.status,
      }),
      sourceDigest: finance.close.sourceDigest,
    };

    return NextResponse.json({
      ok: true,
      data: { stats },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Admin access')) {
      return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
    }
    logger.error(
      'Dashboard error',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}
