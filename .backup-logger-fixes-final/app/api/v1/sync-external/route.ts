import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';
import { type NextRequest, NextResponse } from 'next/server';
import { syncAllExternalData } from '../../../../lib/external-sync';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Log sync request for audit
    logger.warn('External data sync triggered from:', request.headers.get('user-agent'));

    const results = await syncAllExternalData();

    return NextResponse.json({
      ok: true,
      data: {
        message: 'External data sync completed',
        results,
      },
    });
  } catch (error) {
    logger.error('External sync error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to sync external data',
      },
      { status: 500 },
    );
  }
}
