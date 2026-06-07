import { TaxLedgerEntryType } from '@prisma/client';

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_RANGE_DAYS = 30;
const MAX_RANGE_DAYS = 366;

export const ACCOUNTING_EXPORT_KINDS = [
  'ledger',
  'sales',
  'fees',
  'stripe-fees',
  'refunds',
  'provider-costs',
  'tax-collected',
  'expenses',
  'business-expenses',
  'profit-estimate',
] as const;

export type AccountingExportKind = (typeof ACCOUNTING_EXPORT_KINDS)[number];

export type AccountingDateRange = {
  gte: Date;
  lte: Date;
};

export type ExportLedgerEntry = {
  occurredAt: Date;
  entryType: TaxLedgerEntryType;
  amountCents: number;
  currency: string;
  customerJurisdiction: string | null;
  sourceProvider: string;
};

export type ExportBusinessExpense = {
  incurredAt: Date;
  category: string;
  vendor: string | null;
  description: string;
  amountCents: number;
  currency: string;
};

const KIND_TYPES: Record<Exclude<AccountingExportKind, 'expenses' | 'business-expenses'>, TaxLedgerEntryType[]> = {
  ledger: [],
  sales: [
    TaxLedgerEntryType.SALE_GROSS,
    TaxLedgerEntryType.DISCOUNT,
    TaxLedgerEntryType.SHIPPING_CHARGED,
  ],
  fees: [TaxLedgerEntryType.STRIPE_FEE],
  'stripe-fees': [TaxLedgerEntryType.STRIPE_FEE],
  refunds: [TaxLedgerEntryType.REFUND],
  'provider-costs': [
    TaxLedgerEntryType.PROVIDER_PRODUCTION_COST,
    TaxLedgerEntryType.PROVIDER_SHIPPING_COST,
  ],
  'tax-collected': [TaxLedgerEntryType.TAX_COLLECTED],
  'profit-estimate': [
    TaxLedgerEntryType.SALE_GROSS,
    TaxLedgerEntryType.DISCOUNT,
    TaxLedgerEntryType.SHIPPING_CHARGED,
    TaxLedgerEntryType.STRIPE_FEE,
    TaxLedgerEntryType.REFUND,
    TaxLedgerEntryType.PROVIDER_PRODUCTION_COST,
    TaxLedgerEntryType.PROVIDER_SHIPPING_COST,
    TaxLedgerEntryType.BUSINESS_EXPENSE,
  ],
};

function parseUtcDate(value: string, endOfDay: boolean) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const suffix = endOfDay ? 'T23:59:59.999Z' : 'T00:00:00.000Z';
  const date = new Date(`${value}${suffix}`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

function utcDayStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function utcDayEnd(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999),
  );
}

export function parseAccountingDateRange(searchParams: URLSearchParams, now = new Date()) {
  const fromValue = searchParams.get('from');
  const toValue = searchParams.get('to');
  const defaultTo = utcDayEnd(now);
  const defaultFrom = new Date(utcDayStart(now).getTime() - (DEFAULT_RANGE_DAYS - 1) * DAY_MS);
  const gte = fromValue ? parseUtcDate(fromValue, false) : defaultFrom;
  const lte = toValue ? parseUtcDate(toValue, true) : defaultTo;

  if (!gte || !lte) {
    return { ok: false as const, error: 'Dates must use YYYY-MM-DD format' };
  }
  if (gte > lte) {
    return { ok: false as const, error: 'The from date must not be after the to date' };
  }
  if (lte.getTime() - gte.getTime() > MAX_RANGE_DAYS * DAY_MS) {
    return { ok: false as const, error: `Date range must not exceed ${MAX_RANGE_DAYS} days` };
  }

  return { ok: true as const, range: { gte, lte } satisfies AccountingDateRange };
}

export function ledgerTypesForExport(kind: AccountingExportKind) {
  if (kind === 'expenses' || kind === 'business-expenses') return [];
  return KIND_TYPES[kind];
}

function sanitizedJurisdiction(value: string | null) {
  if (!value) return '';
  return value.split('-').slice(0, 2).join('-');
}

function safeCsvCell(value: unknown) {
  let text = String(value ?? '');
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function buildCsv(headers: string[], rows: unknown[][]) {
  return [headers, ...rows].map((row) => row.map(safeCsvCell).join(',')).join('\n');
}

export function buildLedgerExportCsv(kind: AccountingExportKind, entries: ExportLedgerEntry[]) {
  const grouped = new Map<
    string,
    {
      date: string;
      currency: string;
      category: string;
      jurisdiction: string;
      provider: string;
      amountCents: number;
    }
  >();

  for (const entry of entries) {
    const date = entry.occurredAt.toISOString().slice(0, 10);
    const category =
      kind === 'profit-estimate' ? 'PROFIT_ESTIMATE' : entry.entryType;
    const jurisdiction =
      kind === 'tax-collected' ? sanitizedJurisdiction(entry.customerJurisdiction) : '';
    const provider = kind === 'provider-costs' ? entry.sourceProvider : '';
    const key = [date, entry.currency, category, jurisdiction, provider].join('|');
    const current = grouped.get(key);
    if (current) {
      current.amountCents += entry.amountCents;
    } else {
      grouped.set(key, {
        date,
        currency: entry.currency,
        category,
        jurisdiction,
        provider,
        amountCents: entry.amountCents,
      });
    }
  }

  const rows = [...grouped.values()]
    .sort((a, b) =>
      [b.date, b.currency, b.category].join('|').localeCompare(
        [a.date, a.currency, a.category].join('|'),
      ),
    )
    .map((row) => [
      row.date,
      row.category,
      row.amountCents,
      row.currency,
      row.jurisdiction,
      row.provider,
    ]);

  return buildCsv(
    ['Date', 'Category', 'Amount Cents', 'Currency', 'Jurisdiction', 'Provider Category'],
    rows,
  );
}

export function buildBusinessExpenseExportCsv(expenses: ExportBusinessExpense[]) {
  return buildCsv(
    ['Date', 'Category', 'Vendor', 'Description', 'Amount Cents', 'Currency'],
    expenses.map((expense) => [
      expense.incurredAt.toISOString().slice(0, 10),
      expense.category,
      expense.vendor ?? '',
      expense.description,
      expense.amountCents,
      expense.currency,
    ]),
  );
}
