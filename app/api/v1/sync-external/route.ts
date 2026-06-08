import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { syncAllExternalData } from '../../../../lib/external-sync';
import { authorizeAdminApi } from '@/app/lib/auth/admin';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const authorization = await authorizeAdminApi(request, 'clerk_admin_or_internal_service');
  if (!authorization.ok) return authorization.response;

  try {
    // Log sync request for audit
    logger.warn('External data sync triggered from:', undefined, { value: request.headers.get('user-agent') });

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
