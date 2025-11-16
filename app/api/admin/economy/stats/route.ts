import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { requireAdmin } from '@/app/lib/authz';

export const runtime = 'nodejs';

/**
 * GET - Economy overview statistics for admin dashboard
 * Returns aggregated petal economy data, discount usage, and cosmetic purchases
 */
export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Aggregate petal statistics
    const [
      totalEarned,
      totalSpent,
      todayEarned,
      todaySpent,
      thirtyDayEarned,
      thirtyDaySpent,
      totalLedgerEntries,
      topEarnSources,
      topSpendReasons,
    ] = await Promise.all([
      // Total petals earned (lifetime)
      db.petalLedger.aggregate({
        where: { type: 'earn' },
        _sum: { amount: true },
      }),

      // Total petals spent (lifetime)
      db.petalLedger.aggregate({
        where: { type: 'spend' },
        _sum: { amount: true },
      }),

      // Today's earnings
      db.petalLedger.aggregate({
        where: {
          type: 'earn',
          createdAt: { gte: today },
        },
        _sum: { amount: true },
      }),

      // Today's spending
      db.petalLedger.aggregate({
        where: {
          type: 'spend',
          createdAt: { gte: today },
        },
        _sum: { amount: true },
      }),

      // 30-day earnings
      db.petalLedger.aggregate({
        where: {
          type: 'earn',
          createdAt: { gte: thirtyDaysAgo },
        },
        _sum: { amount: true },
      }),

      // 30-day spending
      db.petalLedger.aggregate({
        where: {
          type: 'spend',
          createdAt: { gte: thirtyDaysAgo },
        },
        _sum: { amount: true },
      }),

      // Total ledger entries
      db.petalLedger.count(),

      // Top earning sources (by reason)
      db.petalLedger.groupBy({
        by: ['reason'],
        where: { type: 'earn' },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 10,
      }),

      // Top spending reasons
      db.petalLedger.groupBy({
        by: ['reason'],
        where: { type: 'spend' },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 10,
      }),
    ]);

    // Discount statistics
    const [
      totalDiscountRewards,
      totalDiscountPurchases,
      totalDiscountRedemptions,
      topDiscountRewards,
    ] = await Promise.all([
      db.discountReward.count(),
      db.couponGrant.count(),
      db.couponGrant.count({
        where: { redeemedAt: { not: null } },
      }),
      db.discountReward.findMany({
        include: {
          _count: {
            select: {
              CouponGrant: true,
            },
          },
        },
        take: 20,
      }).then((rewards) =>
        rewards.sort((a, b) => b._count.CouponGrant - a._count.CouponGrant).slice(0, 10),
      ),
    ]);

    // Cosmetic purchase statistics
    const [
      totalCosmeticPurchases,
      topCosmetics,
    ] = await Promise.all([
      db.inventoryItem.count({
        where: {
          kind: { in: ['COSMETIC', 'OVERLAY'] },
        },
      }),
      db.inventoryItem.groupBy({
        by: ['sku'],
        where: {
          kind: { in: ['COSMETIC', 'OVERLAY'] },
        },
        _count: { sku: true },
        orderBy: { _count: { sku: 'desc' } },
        take: 10,
      }),
    ]);

    // User wallet statistics
    const [
      totalWallets,
      totalBalance,
      avgBalance,
      topBalances,
    ] = await Promise.all([
      db.petalWallet.count(),
      db.petalWallet.aggregate({
        _sum: { balance: true },
      }),
      db.petalWallet.aggregate({
        _avg: { balance: true },
      }),
      db.petalWallet.findMany({
        orderBy: { balance: 'desc' },
        take: 10,
        include: {
          User: {
            select: {
              username: true,
              displayName: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      data: {
        petals: {
          totalEarned: totalEarned._sum.amount || 0,
          totalSpent: Math.abs(totalSpent._sum.amount || 0),
          netFlow: (totalEarned._sum.amount || 0) - Math.abs(totalSpent._sum.amount || 0),
          todayEarned: todayEarned._sum.amount || 0,
          todaySpent: Math.abs(todaySpent._sum.amount || 0),
          thirtyDayEarned: thirtyDayEarned._sum.amount || 0,
          thirtyDaySpent: Math.abs(thirtyDaySpent._sum.amount || 0),
          totalTransactions: totalLedgerEntries,
          topEarnSources: topEarnSources.map((s) => ({
            reason: s.reason,
            total: s._sum.amount || 0,
          })),
          topSpendReasons: topSpendReasons.map((s) => ({
            reason: s.reason,
            total: Math.abs(s._sum.amount || 0),
          })),
        },
        discounts: {
          totalRewards: totalDiscountRewards,
          totalPurchases: totalDiscountPurchases,
          totalRedemptions: totalDiscountRedemptions,
          activeVouchers: totalDiscountPurchases - totalDiscountRedemptions,
          topRewards: topDiscountRewards.map((r) => ({
            id: r.id,
            name: r.name,
            petalCost: r.petalCost,
            purchases: r._count.CouponGrant,
          })),
        },
        cosmetics: {
          totalPurchases: totalCosmeticPurchases,
          topCosmetics: topCosmetics.map((c) => ({
            sku: c.sku,
            purchaseCount: c._count.sku,
          })),
        },
        wallets: {
          totalWallets,
          totalBalance: totalBalance._sum.balance || 0,
          avgBalance: avgBalance._avg.balance || 0,
          topBalances: topBalances.map((w) => ({
            userId: w.userId,
            balance: w.balance,
            lifetimeEarned: w.lifetimeEarned,
            username: w.User?.username || w.User?.displayName || 'Unknown',
          })),
        },
      },
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
    }
    console.error('Error fetching economy stats:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
