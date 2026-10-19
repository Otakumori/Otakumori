import { type NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/app/lib/auth/admin';
import { createApiError } from '@/app/lib/api-contracts';
import { generateRequestId } from '@/app/lib/request-id';
import { loadFinanceReport, parseFinancePeriod } from '@/lib/finance/reporting';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  try {
    await requireAdmin();
    const period = parseFinancePeriod(new URL(req.url).searchParams);
    const report = await loadFinanceReport(period);
    return NextResponse.json({ ok: true, data: report, requestId });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Admin access')) {
      return NextResponse.json(createApiError('FORBIDDEN', error.message, requestId), {
        status: 403,
      });
    }
    if (error instanceof Error && error.message === 'Invalid finance period') {
      return NextResponse.json(createApiError('VALIDATION_ERROR', error.message, requestId), {
        status: 400,
      });
    }
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to build finance report', requestId),
      { status: 500 },
    );
  }
}
