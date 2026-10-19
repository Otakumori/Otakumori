import { createHash } from 'node:crypto';
import { db } from '@/lib/db';
import { STRIPE_TAX_READINESS, TAX_REGISTRATIONS } from './tax-registry';

export const FINANCE_EXPORT_DATASETS = [
  'pnl',
  'general-ledger',
  'orders',
  'refunds',
  'stripe-reconciliation',
  'provider-cogs',
  'sales-by-jurisdiction',
  'sales-tax-liability',
  'unresolved-reconciliation',
] as const;

export type FinanceExportDataset = (typeof FINANCE_EXPORT_DATASETS)[number];

export type FinancePeriod = { from: Date; to: Date; label: string };

export function parseFinancePeriod(params: URLSearchParams, now = new Date()): FinancePeriod {
  const year = Number(params.get('year') ?? now.getUTCFullYear());
  const defaultFrom = new Date(Date.UTC(year, 0, 1));
  const defaultTo = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
  const fromValue = params.get('from');
  const toValue = params.get('to');
  const from = fromValue ? new Date(`${fromValue}T00:00:00.000Z`) : defaultFrom;
  const to = toValue ? new Date(`${toValue}T23:59:59.999Z`) : defaultTo;
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from >= to) {
    throw new Error('Invalid finance period');
  }
  return { from, to, label: `${from.toISOString()}..${to.toISOString()}` };
}

export async function loadFinanceReport(period: FinancePeriod) {
  const [orders, ledger] = await Promise.all([
    db.order.findMany({
      where: { createdAt: { gte: period.from, lte: period.to } },
      include: {
        OrderItem: {
          select: { id: true, name: true, quantity: true, unitAmount: true, sku: true },
        },
        PrintifyOrderSync: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    db.financialTransaction.findMany({
      where: { createdAt: { gte: period.from, lte: period.to } },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    }),
  ]);

  const byOrder = new Map<string, typeof ledger>();
  for (const row of ledger) {
    if (!row.orderId) continue;
    const list = byOrder.get(row.orderId) ?? [];
    list.push(row);
    byOrder.set(row.orderId, list);
  }

  const reconciliation = orders.map((order) => {
    const rows = byOrder.get(order.id) ?? [];
    const ledgerRevenue = rows
      .filter((row) =>
        ['product_sale', 'discount', 'shipping_income', 'tax_collected'].includes(
          row.category ?? '',
        ),
      )
      .reduce((sum, row) => sum + row.amount, 0);
    const ledgerRefund = Math.abs(
      rows.filter((row) => row.category === 'refund').reduce((sum, row) => sum + row.amount, 0),
    );
    const cogsRow = rows.find((row) =>
      ['provider_cogs', 'provider_cogs_unknown'].includes(row.category ?? ''),
    );
    const issues: string[] = [];
    if (order.paidAt && ledgerRevenue !== order.totalAmount) issues.push('LEDGER_TOTAL_MISMATCH');
    if (ledgerRefund !== (order.refundAmount ?? 0)) issues.push('REFUND_MISMATCH');
    if (order.paidAt && !cogsRow) issues.push('COGS_NOT_CAPTURED');
    if (cogsRow?.category === 'provider_cogs_unknown') issues.push('COGS_UNKNOWN');
    if (order.paidAt && !order.paymentIntentId) issues.push('PAYMENT_INTENT_MISSING');
    if (order.status === 'pending_mapping' || order.PrintifyOrderSync?.error) {
      issues.push('FULFILLMENT_REVIEW');
    }
    return {
      orderId: order.id,
      orderNumber: order.displayNumber,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      status: order.status,
      provider: order.PrintifyOrderSync ? 'printify' : 'unknown',
      stripeSessionId: order.stripeId,
      paymentIntentId: order.paymentIntentId,
      chargeId: order.chargeId,
      providerOrderId: order.printifyId ?? order.PrintifyOrderSync?.printifyOrderId ?? null,
      localTotal: order.totalAmount,
      ledgerRevenue,
      refundAmount: order.refundAmount ?? 0,
      ledgerRefund,
      cogsAmount: cogsRow?.category === 'provider_cogs' ? Math.abs(cogsRow.amount) : null,
      issues,
      financialScope: order.paidAt ? 'PAID_ORDER' : 'CHECKOUT_ONLY',
      reconciled: order.paidAt ? issues.length === 0 : true,
    };
  });

  const sumCategory = (category: string) =>
    ledger.filter((row) => row.category === category).reduce((sum, row) => sum + row.amount, 0);
  const grossSales = sumCategory('product_sale');
  const refunds = Math.abs(sumCategory('refund'));
  const discounts = Math.abs(sumCategory('discount'));
  const shippingCollected = sumCategory('shipping_income');
  const taxCollected = sumCategory('tax_collected');
  const paymentFees = Math.abs(sumCategory('payment_processing'));
  const providerCogs = Math.abs(sumCategory('provider_cogs'));
  const unresolved = reconciliation.filter((row) => !row.reconciled);
  const unresolvedValue = unresolved.reduce((sum, row) => sum + row.localTotal, 0);
  const netSales = grossSales - discounts - refunds;
  const contribution = netSales + shippingCollected - paymentFees - providerCogs;

  const sourceDigest = createHash('sha256')
    .update(
      JSON.stringify({
        period: period.label,
        orders: orders.map((order) => [order.id, order.updatedAt.toISOString(), order.totalAmount]),
        ledger: ledger.map((row) => [row.id, row.amount, row.createdAt.toISOString()]),
      }),
    )
    .digest('hex');

  const jurisdictionMap = new Map<
    string,
    {
      country: string;
      state: string;
      salesCents: number;
      taxCollectedCents: number;
      orderIds: Set<string>;
      authority: string;
    }
  >();
  for (const row of ledger.filter((entry) =>
    ['product_sale', 'discount', 'tax_collected'].includes(entry.category ?? ''),
  )) {
    const metadata = (row.metadata ?? {}) as {
      jurisdiction?: { country?: string | null; state?: string | null };
    };
    const country = metadata.jurisdiction?.country ?? 'UNKNOWN';
    const state = metadata.jurisdiction?.state ?? 'UNKNOWN';
    const key = `${country}:${state}`;
    const current = jurisdictionMap.get(key) ?? {
      country,
      state,
      salesCents: 0,
      taxCollectedCents: 0,
      orderIds: new Set<string>(),
      authority: 'stripe_checkout_shipping_address',
    };
    if (row.category === 'tax_collected') current.taxCollectedCents += row.amount;
    else current.salesCents += row.amount;
    if (row.orderId) current.orderIds.add(row.orderId);
    jurisdictionMap.set(key, current);
  }
  const jurisdictionRows = [...jurisdictionMap.values()].map((row) => ({
    country: row.country,
    state: row.state,
    salesCents: row.salesCents,
    taxCollectedCents: row.taxCollectedCents,
    orderCount: row.orderIds.size,
    authority: row.authority,
    taxReadiness: STRIPE_TAX_READINESS.status,
  }));

  return {
    period,
    overview: {
      grossSales,
      refunds,
      netSales,
      discounts,
      shippingCollected,
      shippingExpense: null,
      taxCollected,
      paymentFees,
      providerCogs,
      contribution,
      unreconciledCount: unresolved.length,
      unreconciledValue: unresolvedValue,
    },
    orders,
    ledger,
    reconciliation,
    tax: {
      readiness: STRIPE_TAX_READINESS,
      registrations: TAX_REGISTRATIONS,
      jurisdictionRows,
    },
    close: {
      ready: unresolved.length === 0 && STRIPE_TAX_READINESS.status !== 'BLOCKED',
      sourceDigest,
      blockers: [
        ...(unresolved.length > 0 ? [`${unresolved.length} unreconciled order(s)`] : []),
        ...(STRIPE_TAX_READINESS.status === 'BLOCKED' ? ['Stripe Tax readiness is blocked'] : []),
      ],
    },
  };
}

function csvCell(value: unknown) {
  const text =
    value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function rowsToCsv(rows: Record<string, unknown>[], provenance: Record<string, string>) {
  const keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const preamble = Object.entries(provenance).map(([key, value]) => `# ${key}: ${value}`);
  if (keys.length === 0) return [...preamble, '# no rows'].join('\n');
  return [
    ...preamble,
    keys.map(csvCell).join(','),
    ...rows.map((row) => keys.map((key) => csvCell(row[key])).join(',')),
  ].join('\n');
}

export function selectExportRows(
  report: Awaited<ReturnType<typeof loadFinanceReport>>,
  dataset: FinanceExportDataset,
): Record<string, unknown>[] {
  if (dataset === 'general-ledger') return report.ledger as unknown as Record<string, unknown>[];
  if (dataset === 'orders') return report.orders as unknown as Record<string, unknown>[];
  if (dataset === 'refunds') {
    return report.ledger.filter((row) => row.category === 'refund') as unknown as Record<
      string,
      unknown
    >[];
  }
  if (dataset === 'provider-cogs') {
    return report.ledger.filter((row) =>
      ['provider_cogs', 'provider_cogs_unknown'].includes(row.category ?? ''),
    ) as unknown as Record<string, unknown>[];
  }
  if (dataset === 'unresolved-reconciliation') {
    return report.reconciliation.filter((row) => !row.reconciled);
  }
  if (dataset === 'stripe-reconciliation') return report.reconciliation;
  if (dataset === 'sales-by-jurisdiction' || dataset === 'sales-tax-liability') {
    return report.tax.jurisdictionRows;
  }
  return [report.overview];
}
