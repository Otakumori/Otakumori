import 'server-only';

import { OrderStatus, TaxLedgerEntryType } from '@prisma/client';

type DateRange = { gte?: Date; lte?: Date };

type AccountingSummaryDb = {
  order: {
    count(args: { where?: Record<string, unknown> }): Promise<number>;
  };
  taxLedgerEntry: {
    aggregate(args: {
      where: {
        entryType: TaxLedgerEntryType | { in: TaxLedgerEntryType[] };
        occurredAt?: DateRange;
      };
      _sum: { amountCents: true };
    }): Promise<{ _sum: { amountCents: number | null } }>;
  };
  financialTransaction: {
    groupBy(args: {
      by: ['type'];
      _sum: { amount: true };
      _count: { _all: true };
    }): Promise<Array<{ type: string; _sum: { amount: number | null }; _count: { _all: number } }>>;
  };
};

type LedgerTotals = {
  saleGross: number;
  discount: number;
  shippingCharged: number;
  taxCollected: number;
  stripeFees: number;
  refunds: number;
  providerProductionCost: number;
  providerShippingCost: number;
  businessExpenses: number;
  netRevenueEstimate: number;
  grossRevenueEstimate: number;
  grossMarginEstimate: number;
  profitEstimate: number;
};

type FinancialTransactionReconciliation = {
  status: 'empty' | 'parity' | 'drift' | 'unmapped';
  mappedTransactions: number;
  unmappedTransactions: number;
  legacyAmountCents: number;
  ledgerAmountCents: number;
  deltaCents: number;
  byType: Record<string, number>;
};

export type AdminOrderSummary = {
  totalRevenue: number;
  grossSales: number;
  discounts: number;
  shippingCollected: number;
  taxCollected: number;
  stripeFees: number;
  refunds: number;
  providerCosts: number;
  grossMarginEstimate: number;
  netRevenueEstimate: number;
  businessExpenses: number;
  profitEstimate: number;
  totalOrders: number;
  pendingOrders: number;
  pendingFulfillmentOrders: number;
  inProductionOrders: number;
  shippedOrders: number;
  cancelledOrders: number;
  thisMonth: number;
  lastMonth: number;
  thisYear: number;
  totalRefunds: number;
  ledger: LedgerTotals;
  financialTransactionCompatibility: FinancialTransactionReconciliation;
};

const TOTAL_REVENUE_TYPES = [
  TaxLedgerEntryType.SALE_GROSS,
  TaxLedgerEntryType.DISCOUNT,
  TaxLedgerEntryType.SHIPPING_CHARGED,
];

const FINANCIAL_TRANSACTION_TYPE_MAP: Record<string, keyof Pick<
  LedgerTotals,
  'saleGross' | 'shippingCharged' | 'taxCollected' | 'stripeFees' | 'refunds'
>> = {
  sale: 'saleGross',
  shipping: 'shippingCharged',
  tax: 'taxCollected',
  fee: 'stripeFees',
  refund: 'refunds',
};

function abs(cents: number) {
  return Math.abs(cents);
}

async function sumLedger(
  db: AccountingSummaryDb,
  entryType: TaxLedgerEntryType | TaxLedgerEntryType[],
  occurredAt?: DateRange,
) {
  const result = await db.taxLedgerEntry.aggregate({
    where: {
      entryType: Array.isArray(entryType) ? { in: entryType } : entryType,
      ...(occurredAt ? { occurredAt } : {}),
    },
    _sum: { amountCents: true },
  });
  return result._sum.amountCents ?? 0;
}

async function ledgerTotals(db: AccountingSummaryDb): Promise<LedgerTotals> {
  const [
    saleGross,
    discount,
    shippingCharged,
    taxCollected,
    stripeFees,
    refunds,
    providerProductionCost,
    providerShippingCost,
    businessExpenses,
  ] = await Promise.all([
    sumLedger(db, TaxLedgerEntryType.SALE_GROSS),
    sumLedger(db, TaxLedgerEntryType.DISCOUNT),
    sumLedger(db, TaxLedgerEntryType.SHIPPING_CHARGED),
    sumLedger(db, TaxLedgerEntryType.TAX_COLLECTED),
    sumLedger(db, TaxLedgerEntryType.STRIPE_FEE),
    sumLedger(db, TaxLedgerEntryType.REFUND),
    sumLedger(db, TaxLedgerEntryType.PROVIDER_PRODUCTION_COST),
    sumLedger(db, TaxLedgerEntryType.PROVIDER_SHIPPING_COST),
    sumLedger(db, TaxLedgerEntryType.BUSINESS_EXPENSE),
  ]);

  const grossRevenueEstimate = saleGross + discount + shippingCharged;
  const grossMarginEstimate =
    grossRevenueEstimate -
    abs(refunds) -
    abs(providerProductionCost) -
    abs(providerShippingCost);
  const derivedNetRevenueEstimate = grossMarginEstimate - abs(stripeFees);
  const profitEstimate = derivedNetRevenueEstimate - abs(businessExpenses);

  return {
    saleGross,
    discount,
    shippingCharged,
    taxCollected,
    stripeFees: abs(stripeFees),
    refunds: abs(refunds),
    providerProductionCost: abs(providerProductionCost),
    providerShippingCost: abs(providerShippingCost),
    businessExpenses: abs(businessExpenses),
    // Snapshot rows remain available for audit, but the authoritative figure is
    // derived from signed atomic entries so later refunds and costs are included.
    netRevenueEstimate: derivedNetRevenueEstimate,
    grossRevenueEstimate,
    grossMarginEstimate,
    profitEstimate,
  };
}

async function reconcileFinancialTransactions(
  db: AccountingSummaryDb,
  totals: LedgerTotals,
): Promise<FinancialTransactionReconciliation> {
  const groups = await db.financialTransaction.groupBy({
    by: ['type'],
    _sum: { amount: true },
    _count: { _all: true },
  });
  const byType: Record<string, number> = {};
  let mappedTransactions = 0;
  let unmappedTransactions = 0;
  let legacyAmountCents = 0;
  let ledgerAmountCents = 0;

  for (const group of groups) {
    const type = group.type.trim().toLowerCase();
    const amount = group._sum.amount ?? 0;
    byType[type] = (byType[type] ?? 0) + amount;
    const ledgerKey = FINANCIAL_TRANSACTION_TYPE_MAP[type];
    if (!ledgerKey) {
      unmappedTransactions += group._count._all;
      continue;
    }

    mappedTransactions += group._count._all;
    legacyAmountCents += amount;
    const ledgerValue = totals[ledgerKey];
    ledgerAmountCents +=
      ledgerKey === 'stripeFees' || ledgerKey === 'refunds' ? -ledgerValue : ledgerValue;
  }

  const deltaCents = legacyAmountCents - ledgerAmountCents;
  const transactionCount = mappedTransactions + unmappedTransactions;
  const status =
    transactionCount === 0
      ? 'empty'
      : unmappedTransactions > 0
        ? 'unmapped'
        : deltaCents === 0
          ? 'parity'
          : 'drift';

  return {
    status,
    mappedTransactions,
    unmappedTransactions,
    legacyAmountCents,
    ledgerAmountCents,
    deltaCents,
    byType,
  };
}

export async function buildAdminOrderSummary(
  db: AccountingSummaryDb,
  now = new Date(),
): Promise<AdminOrderSummary> {
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  const thisYearStart = new Date(now.getFullYear(), 0, 1);

  const [
    totalOrders,
    pendingOrders,
    pendingFulfillmentOrders,
    inProductionOrders,
    shippedOrders,
    cancelledOrders,
    totalRevenue,
    thisMonth,
    lastMonth,
    thisYear,
    totals,
  ] = await Promise.all([
    db.order.count({ where: { status: { not: OrderStatus.cancelled } } }),
    db.order.count({ where: { status: OrderStatus.pending } }),
    db.order.count({ where: { status: OrderStatus.pending_fulfillment } }),
    db.order.count({ where: { status: OrderStatus.in_production } }),
    db.order.count({ where: { status: OrderStatus.shipped } }),
    db.order.count({ where: { status: OrderStatus.cancelled } }),
    sumLedger(db, TOTAL_REVENUE_TYPES),
    sumLedger(db, TOTAL_REVENUE_TYPES, { gte: thisMonthStart }),
    sumLedger(db, TOTAL_REVENUE_TYPES, { gte: lastMonthStart, lte: lastMonthEnd }),
    sumLedger(db, TOTAL_REVENUE_TYPES, { gte: thisYearStart }),
    ledgerTotals(db),
  ]);
  const financialTransactionCompatibility = await reconcileFinancialTransactions(db, totals);
  const providerCosts = totals.providerProductionCost + totals.providerShippingCost;

  return {
    totalRevenue,
    grossSales: totals.saleGross,
    discounts: abs(totals.discount),
    shippingCollected: totals.shippingCharged,
    taxCollected: totals.taxCollected,
    stripeFees: totals.stripeFees,
    refunds: totals.refunds,
    providerCosts,
    grossMarginEstimate: totals.grossMarginEstimate,
    netRevenueEstimate: totals.netRevenueEstimate,
    businessExpenses: totals.businessExpenses,
    profitEstimate: totals.profitEstimate,
    totalOrders,
    pendingOrders,
    pendingFulfillmentOrders,
    inProductionOrders,
    shippedOrders,
    cancelledOrders,
    thisMonth,
    lastMonth,
    thisYear,
    totalRefunds: totals.refunds,
    ledger: totals,
    financialTransactionCompatibility,
  };
}
