import { type NextRequest, NextResponse } from 'next/server';
import { TaxLedgerEntryType } from '@prisma/client';
import { requireAdmin } from '@/app/lib/auth/admin';
import { createApiError } from '@/app/lib/api-contracts';
import { db } from '@/app/lib/db';
import { generateRequestId } from '@/app/lib/request-id';

export const runtime = 'nodejs';

const LEDGER_KIND_TYPES: Record<string, TaxLedgerEntryType[]> = {
  ledger: [],
  sales: [
    TaxLedgerEntryType.SALE_GROSS,
    TaxLedgerEntryType.DISCOUNT,
    TaxLedgerEntryType.SHIPPING_CHARGED,
  ],
  fees: [TaxLedgerEntryType.STRIPE_FEE],
  refunds: [TaxLedgerEntryType.REFUND],
  'provider-costs': [
    TaxLedgerEntryType.PROVIDER_PRODUCTION_COST,
    TaxLedgerEntryType.PROVIDER_SHIPPING_COST,
  ],
  'tax-collected': [TaxLedgerEntryType.TAX_COLLECTED],
  expenses: [TaxLedgerEntryType.BUSINESS_EXPENSE],
};

function parseDateRange(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const createdAt: { gte?: Date; lte?: Date } = {};

  if (from) {
    const date = new Date(from);
    if (!Number.isNaN(date.getTime())) createdAt.gte = date;
  }

  if (to) {
    const date = new Date(to);
    if (!Number.isNaN(date.getTime())) {
      date.setHours(23, 59, 59, 999);
      createdAt.lte = date;
    }
  }

  return Object.keys(createdAt).length > 0 ? createdAt : undefined;
}
function escapeCsv(value: unknown) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function buildCsv(headers: string[], rows: unknown[][]) {
  return [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
}

function dollars(cents: number) {
  return (cents / 100).toFixed(2);
}

async function exportExpenses(createdAt?: { gte?: Date; lte?: Date }) {
  const expenses = await db.businessExpense.findMany({
    where: createdAt ? { incurredAt: createdAt } : undefined,
    orderBy: { incurredAt: 'desc' },
    take: 10000,
  });

  return buildCsv(
    [
      'Date',
      'Category',
      'Vendor',
      'Description',
      'Amount',
      'Currency',
      'Paid At',
      'Source Provider',
      'Source Reference',
      'Order ID',
    ],
    expenses.map((expense) => [
      expense.incurredAt.toISOString(),
      expense.category,
      expense.vendor ?? '',
      expense.description,
      dollars(expense.amountCents),
      expense.currency,
      expense.paidAt?.toISOString() ?? '',
      expense.sourceProvider ?? '',
      expense.sourceReference ?? '',
      expense.orderId ?? '',
    ]),
  );
}

async function exportLedger(kind: string, createdAt?: { gte?: Date; lte?: Date }) {
  const types = LEDGER_KIND_TYPES[kind] ?? [];
  const entries = await db.taxLedgerEntry.findMany({
    where: {
      ...(types.length > 0 ? { entryType: { in: types } } : {}),
      ...(createdAt ? { occurredAt: createdAt } : {}),
    },
    orderBy: { occurredAt: 'desc' },
    take: 10000,
  });

  return buildCsv(
    [
      'Date',
      'Entry Type',
      'Amount',
      'Currency',
      'Order ID',
      'Jurisdiction',
      'Source Provider',
      'Source Reference',
      'Source Event ID',
      'Reversal Of Entry ID',
    ],
    entries.map((entry) => [
      entry.occurredAt.toISOString(),
      entry.entryType,
      dollars(entry.amountCents),
      entry.currency,
      entry.orderId ?? '',
      entry.customerJurisdiction ?? '',
      entry.sourceProvider,
      entry.sourceReference ?? '',
      entry.sourceEventId ?? '',
      entry.reversalOfEntryId ?? '',
    ]),
  );
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

    const allowedKinds = new Set([
      ...Object.keys(LEDGER_KIND_TYPES),
      'business-expenses',
    ]);
    if (!allowedKinds.has(kind)) {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'Unsupported accounting export kind', requestId),
        { status: 400 },
      );
    }

    const dateRange = parseDateRange(req);
    const csv =
      kind === 'business-expenses' || kind === 'expenses'
        ? await exportExpenses(dateRange)
        : await exportLedger(kind, dateRange);

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
