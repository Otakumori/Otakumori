import { type NextRequest, NextResponse } from 'next/server';
import { requireAdminApi as requireAdmin } from '@/app/lib/auth/admin';
import { createApiError } from '@/app/lib/api-contracts';
import { db } from '@/app/lib/db';
import { generateRequestId } from '@/app/lib/request-id';
import {
  ACCOUNTING_EXPORT_KINDS,
  type AccountingExportKind,
  buildBusinessExpenseExportCsv,
  buildLedgerExportCsv,
  ledgerTypesForExport,
  parseAccountingDateRange,
} from '@/lib/accounting/exports';

export const runtime = 'nodejs';

async function exportExpenses(incurredAt: { gte: Date; lte: Date }) {
  const expenses = await db.businessExpense.findMany({
    where: { incurredAt },
    orderBy: { incurredAt: 'desc' },
    take: 10000,
    select: {
      incurredAt: true,
      category: true,
      vendor: true,
      description: true,
      amountCents: true,
      currency: true,
    },
  });

  return buildBusinessExpenseExportCsv(expenses);
}

async function exportLedger(kind: AccountingExportKind, occurredAt: { gte: Date; lte: Date }) {
  const types = ledgerTypesForExport(kind);
  const entries = await db.taxLedgerEntry.findMany({
    where: {
      ...(types.length > 0 ? { entryType: { in: types } } : {}),
      occurredAt,
    },
    orderBy: { occurredAt: 'desc' },
    take: 10000,
    select: {
      occurredAt: true,
      entryType: true,
      amountCents: true,
      currency: true,
      customerJurisdiction: true,
      sourceProvider: true,
    },
  });

  return buildLedgerExportCsv(kind, entries);
}

export async function GET(req: NextRequest) {
  const requestId = generateRequestId();

  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') ?? 'csv';
    const kind = searchParams.get('kind') ?? 'ledger';

    if (format !== 'csv') {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'Only CSV format is supported', requestId),
        { status: 400 },
      );
    }

    const allowedKinds = new Set<string>(ACCOUNTING_EXPORT_KINDS);
    if (!allowedKinds.has(kind)) {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'Unsupported accounting export kind', requestId),
        { status: 400 },
      );
    }

    const parsedRange = parseAccountingDateRange(searchParams);
    if (!parsedRange.ok) {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', parsedRange.error, requestId),
        { status: 400 },
      );
    }

    const exportKind = kind as AccountingExportKind;
    const csv =
      kind === 'business-expenses' || kind === 'expenses'
        ? await exportExpenses(parsedRange.range)
        : await exportLedger(exportKind, parsedRange.range);

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="accounting-${kind}-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Admin access')) {
      return NextResponse.json(createApiError('FORBIDDEN', error.message, requestId), {
        status: 403,
      });
    }

    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to export accounting records', requestId),
      { status: 500 },
    );
  }
}
