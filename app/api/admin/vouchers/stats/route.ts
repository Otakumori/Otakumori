import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/app/lib/auth/admin';
import { db } from '@/app/lib/db';

export const runtime = 'nodejs';

async function handler() {
  try {
    const now = new Date();

    // Get all vouchers
    const allVouchers = await db.couponGrant.findMany({
      select: {
        id: true,
        expiresAt: true,
        redeemedAt: true,
        userId: true,
      },
    });

    const totalVouchers = allVouchers.length;
    const activeVouchers = allVouchers.filter(
      (v) => !v.redeemedAt && (!v.expiresAt || v.expiresAt > now),
    ).length;
    const redeemedVouchers = allVouchers.filter((v) => v.redeemedAt).length;
    const expiredVouchers = allVouchers.filter(
      (v) => !v.redeemedAt && v.expiresAt && v.expiresAt <= now,
    ).length;

    // Get top users by voucher count
    const userVoucherCounts = allVouchers.reduce(
      (acc, v) => {
        acc[v.userId] = (acc[v.userId] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const topUserIds = Object.entries(userVoucherCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([userId]) => userId);

    const topUsersData = await db.user.findMany({
      where: {
        id: { in: topUserIds },
      },
      select: {
        id: true,
        username: true,
      },
    });

    const topUsers = topUserIds.map((userId) => {
      const user = topUsersData.find((u) => u.id === userId);
      return {
        userId,
        username: user?.username || 'Unknown',
        voucherCount: userVoucherCounts[userId],
      };
    });

    return NextResponse.json({
      ok: true,
      data: {
        totalVouchers,
        activeVouchers,
        redeemedVouchers,
        expiredVouchers,
        totalDiscountValue: 0, // TODO: Calculate if needed
        topUsers,
      },
    });
  } catch (error) {
    console.error('Error fetching voucher stats:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch voucher stats' },
      { status: 500 },
    );
  }
}

export const GET = withAdminAuth(handler);
