import { type NextRequest, NextResponse } from 'next/server';
import { requireAdminApi as requireAdmin } from '@/app/lib/auth/admin';
import { db } from '@/app/lib/db';
import { generateRequestId } from '@/app/lib/request-id';
import { createApiError } from '@/app/lib/api-contracts';
import { buildAdminOrderSummary } from '@/lib/accounting/admin-summary';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    await requireAdmin();
    const summary = await buildAdminOrderSummary(db);
    
    return NextResponse.json({
      ok: true,
      data: summary,
      requestId,
    });
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('Admin access')) {
      return NextResponse.json(
        createApiError('FORBIDDEN', error.message, requestId),
        { status: 403 },
      );
    }
    
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to fetch order summary', requestId),
      { status: 500 },
    );
  }
}

