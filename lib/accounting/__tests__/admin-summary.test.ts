import { describe, expect, it, vi } from 'vitest';
import { OrderStatus, TaxLedgerEntryType } from '@prisma/client';
import { buildAdminOrderSummary } from '@/lib/accounting/admin-summary';

describe('admin accounting summary', () => {
  it('uses ledger rows instead of FinancialTransaction for revenue and refunds', async () => {
    const count = vi.fn(async ({ where }) => {
      if ((where as any)?.status === OrderStatus.pending) return 2;
      if ((where as any)?.status === OrderStatus.pending_fulfillment) return 3;
      if ((where as any)?.status === OrderStatus.in_production) return 4;
      if ((where as any)?.status === OrderStatus.shipped) return 5;
      if ((where as any)?.status === OrderStatus.cancelled) return 1;
      return 14;
    });
    const sums = new Map<TaxLedgerEntryType, number>([
      [TaxLedgerEntryType.SALE_GROSS, 10000],
      [TaxLedgerEntryType.DISCOUNT, -1000],
      [TaxLedgerEntryType.SHIPPING_CHARGED, 900],
      [TaxLedgerEntryType.TAX_COLLECTED, 700],
      [TaxLedgerEntryType.STRIPE_FEE, -350],
      [TaxLedgerEntryType.REFUND, -1200],
      [TaxLedgerEntryType.PROVIDER_PRODUCTION_COST, -3000],
      [TaxLedgerEntryType.PROVIDER_SHIPPING_COST, -700],
      [TaxLedgerEntryType.BUSINESS_EXPENSE, -250],
      [TaxLedgerEntryType.NET_REVENUE_ESTIMATE, 5450],
    ]);
    const aggregate = vi.fn(async ({ where }) => {
      const entryType = (where as any).entryType;
      if (typeof entryType === 'object' && Array.isArray(entryType.in)) {
        return {
          _sum: {
            amountCents: entryType.in.reduce(
              (sum: number, type: TaxLedgerEntryType) => sum + (sums.get(type) ?? 0),
              0,
            ),
          },
        };
      }
      return { _sum: { amountCents: sums.get(entryType) ?? 0 } };
    });

    const summary = await buildAdminOrderSummary(
      {
        order: { count },
        taxLedgerEntry: { aggregate },
        financialTransaction: {
          groupBy: vi.fn(async () => [
            { type: 'sale', _sum: { amount: 10000 }, _count: { _all: 1 } },
            { type: 'refund', _sum: { amount: -1200 }, _count: { _all: 1 } },
          ]),
        },
      },
      new Date('2026-06-04T12:00:00.000Z'),
    );

    expect(summary.totalRevenue).toBe(9900);
    expect(summary.totalRefunds).toBe(1200);
    expect(summary.pendingFulfillmentOrders).toBe(3);
    expect(summary.ledger).toEqual(
      expect.objectContaining({
        stripeFees: 350,
        providerProductionCost: 3000,
        providerShippingCost: 700,
        businessExpenses: 250,
        grossRevenueEstimate: 9900,
        grossMarginEstimate: 5000,
        netRevenueEstimate: 4650,
        profitEstimate: 4400,
      }),
    );
    expect(summary.taxCollected).toBe(700);
    expect(summary.financialTransactionCompatibility).toEqual(
      expect.objectContaining({
        status: 'parity',
        mappedTransactions: 2,
        unmappedTransactions: 0,
      }),
    );
  });
});
