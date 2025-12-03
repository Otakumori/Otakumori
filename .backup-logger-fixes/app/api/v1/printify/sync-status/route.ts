import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { getSyncStats } from '@/lib/catalog/printifySync';
import { requireAdmin } from '@/app/lib/auth/admin';

export const runtime = 'nodejs';

/**
 * GET /api/v1/printify/sync-status
 * Get sync status and statistics
 */
export async function GET(_request: NextRequest) {
  try {
    await requireAdmin();

    const stats = await getSyncStats();

    return NextResponse.json({
      ok: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Failed to get sync status:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    );
  }
}

