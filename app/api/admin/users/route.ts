import { logger } from '@/app/lib/logger';
import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/app/lib/auth/admin';
import { db } from '@/app/lib/db';

export const runtime = 'nodejs';

async function handler() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        petalBalance: true,
        nsfwEnabled: true,
        createdAt: true,
        PetalWallet: {
          select: {
            lifetimeEarned: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1000, // Limit to prevent huge queries
    });

    const usersWithLifetime = users.map((user) => ({
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      petalBalance: user.petalBalance,
      lifetimePetalsEarned: user.PetalWallet?.lifetimeEarned || 0,
      nsfwEnabled: user.nsfwEnabled,
      createdAt: user.createdAt,
    }));

    return NextResponse.json({
      ok: true,
      data: {
        users: usersWithLifetime,
      },
    });
  } catch (error) {
    logger.error('Users error', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ ok: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}

export const GET = withAdminAuth(handler);
