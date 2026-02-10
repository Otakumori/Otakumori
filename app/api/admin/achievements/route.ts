import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';

export const runtime = 'nodejs';

/**
 * GET - List all achievements for admin dropdown
 */
export async function GET() {
  try {
    const { requireAdmin } = await import('@/app/lib/authz');
    await requireAdmin();

    const achievements = await db.achievement.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        points: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      ok: true,
      data: { achievements },
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
    }
    const { logger } = await import('@/app/lib/logger');
    logger.error('Error fetching achievements:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
