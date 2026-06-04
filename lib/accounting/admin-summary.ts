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
};

export type AdminOrderSummary = {
  totalRevenue: number;
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
};

const TOTAL_REVENUE_TYPES = [
  TaxLedgerEntryType.SALE_GROSS,
  TaxLedgerEntryType.DISCOUNT,
  TaxLedgerEntryType.SHIPPING_CHARGED,
  TaxLedgerEntryType.TAX_COLLECTED,
];

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
    netRevenueEstimate,
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
    sumLedger(db, TaxLedgerEntryType.NET_REVENUE_ESTIMATE),
  ]);

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
    netRevenueEstimate,
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

  return {
    totalRevenue,
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
  };
}
