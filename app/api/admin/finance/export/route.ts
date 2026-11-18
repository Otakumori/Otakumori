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

async function workbookResponse(
  report: Awaited<ReturnType<typeof loadFinanceReport>>,
  period: ReturnType<typeof parseFinancePeriod>,
  generatedBy?: string,
) {
  const { buildFinanceWorkbook } = await import('@/lib/finance/xlsx');
  const workbook = await buildFinanceWorkbook(report);
  const fileName = `otaku-mori-financial-report-${period.from.toISOString().slice(0, 10)}-${period.to.toISOString().slice(0, 10)}.xlsx`;

  if (generatedBy) {
    const { db } = await import('@/lib/db');
    await db.financialReportExport.upsert({
      where: {
        merchantAccountId_environment_periodStart_periodEnd_reportVersion_sourceDigest: {
          merchantAccountId: report.methodology.merchantAccountId,
          environment: report.methodology.reportingEnvironment,
          periodStart: period.from,
          periodEnd: period.to,
          reportVersion: report.methodology.reportVersion,
          sourceDigest: report.close.sourceDigest,
        },
      },
      update: { fileName, status: 'GENERATED', generatedBy },
      create: {
        merchantAccountId: report.methodology.merchantAccountId,
        environment: report.methodology.reportingEnvironment,
        periodStart: period.from,
        periodEnd: period.to,
        timezone: report.methodology.timezone,
        accountingMethod: report.methodology.accountingMethod,
        reportVersion: report.methodology.reportVersion,
        sourceDigest: report.close.sourceDigest,
        fileName,
        status: 'GENERATED',
        generatedBy,
        rowCounts: {
          transactions: report.ledger.length,
          orders: report.orders.length,
          reconciliation: report.reconciliation.length,
        },
        limitations: report.methodology.limitations,
      },
    });
  }

  return new NextResponse(new Uint8Array(workbook), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  try {
    const admin = await requireAdmin();
    const params = new URL(req.url).searchParams;
    const format = params.get('format') ?? 'csv';
    const dataset = params.get('dataset') as FinanceExportDataset | null;
    if (format !== 'xlsx' && (!dataset || !FINANCE_EXPORT_DATASETS.includes(dataset))) {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'Unknown finance export dataset', requestId),
        { status: 400 },
      );
    }
    const period = parseFinancePeriod(params);
    const report = await loadFinanceReport(period);
    if (format === 'xlsx') {
      return workbookResponse(report, period, admin.id);
    }
    if (!dataset) {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'Unknown finance export dataset', requestId),
        { status: 400 },
      );
    }
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
    if (
      error instanceof Error &&
      (error.message === 'Invalid finance period' ||
        error.message === 'Finance period exceeds 370 days')
    ) {
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

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  try {
    const admin = await requireAdmin();
    const period = parseFinancePeriod(new URL(req.url).searchParams);
    const report = await loadFinanceReport(period);
    return workbookResponse(report, period, admin.id);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Admin access')) {
      return NextResponse.json(createApiError('FORBIDDEN', error.message, requestId), {
        status: 403,
      });
    }
    if (
      error instanceof Error &&
      (error.message === 'Invalid finance period' ||
        error.message === 'Finance period exceeds 370 days')
    ) {
      return NextResponse.json(createApiError('VALIDATION_ERROR', error.message, requestId), {
        status: 400,
      });
    }
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to generate finance workbook', requestId),
      { status: 500 },
    );
  }
}
