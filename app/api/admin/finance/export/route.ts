import { type NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/app/lib/auth/admin';
import { createApiError } from '@/app/lib/api-contracts';
import { generateRequestId } from '@/app/lib/request-id';
import {
  FINANCE_EXPORT_DATASETS,
  type FinanceExportDataset,
  loadFinanceReport,
  parseFinancePeriod,
  rowsToCsv,
  selectExportRows,
} from '@/lib/finance/reporting';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  try {
    await requireAdmin();
    const params = new URL(req.url).searchParams;
    const dataset = params.get('dataset') as FinanceExportDataset | null;
    if (!dataset || !FINANCE_EXPORT_DATASETS.includes(dataset)) {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'Unknown finance export dataset', requestId),
        { status: 400 },
      );
    }
    const period = parseFinancePeriod(params);
    const report = await loadFinanceReport(period);
    const csv = rowsToCsv(selectExportRows(report, dataset), {
      dataset,
      period: period.label,
      sourceDigest: report.close.sourceDigest,
      generatedAt: new Date().toISOString(),
      provenance: 'Order + FinancialTransaction canonical authorities',
    });
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="finance-${dataset}-${period.from.getUTCFullYear()}.csv"`,
        'Cache-Control': 'private, no-store',
      },
    });
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
      createApiError('INTERNAL_ERROR', 'Failed to export finance data', requestId),
      { status: 500 },
    );
  }
}
