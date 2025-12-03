import { logger } from '@/app/lib/logger';
import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { requireAdmin } from '@/app/lib/authz';

export const runtime = 'nodejs';

/**
 * GET - List all achievements for admin dropdown
 */
export async function GET() {
  try {
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
    logger.error('Error fetching achievements:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
