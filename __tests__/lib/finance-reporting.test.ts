import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ orderFind: vi.fn(), ledgerFind: vi.fn() }));
vi.mock('@/lib/db', () => ({
  db: {
    order: { findMany: mocks.orderFind },
    financialTransaction: { findMany: mocks.ledgerFind },
  },
}));

import {
  loadFinanceReport,
  parseFinancePeriod,
  rowsToCsv,
  selectExportRows,
} from '@/lib/finance/reporting';

const period = {
  from: new Date('2026-01-01T00:00:00.000Z'),
  to: new Date('2027-01-01T00:00:00.000Z'),
  label: '2026',
};

function order() {
  return {
    id: 'order_1',
    displayNumber: 7,
    createdAt: new Date('2026-02-01T00:00:00.000Z'),
    updatedAt: new Date('2026-02-02T00:00:00.000Z'),
    paidAt: new Date('2026-02-02T00:00:00.000Z'),
    status: 'in_production',
    stripeId: 'cs_1',
    paymentIntentId: 'pi_1',
    chargeId: 'ch_1',
    printifyId: 'po_1',
    totalAmount: 3500,
    subtotalCents: 3200,
    discountAmount: 200,
    shippingAmount: 500,
    taxAmount: 0,
    refundAmount: 0,
    OrderItem: [],
    PrintifyOrderSync: { printifyOrderId: 'po_1', status: 'accepted', error: null },
  };
}

function row(id: string, category: string, amount: number) {
  return {
    id,
    orderId: 'order_1',
    type: 'sale',
    category,
    amount,
    currency: 'USD',
    description: id,
    stripeChargeId: 'ch_1',
    stripeRefundId: null,
    metadata: {},
    createdAt: new Date('2026-02-02T00:00:00.000Z'),
  };
}

describe('finance reporting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.orderFind.mockResolvedValue([order()]);
    mocks.ledgerFind.mockResolvedValue([
      row('sale', 'product_sale', 3200),
      row('discount', 'discount', -200),
      row('shipping', 'shipping_income', 500),
      row('cogs', 'provider_cogs', -1200),
      row('fee', 'payment_processing', -130),
    ]);
  });

  it('reconciles authoritative totals and computes a traceable contribution view', async () => {
    const report = await loadFinanceReport(period);
    expect(report.reconciliation[0]).toMatchObject({ reconciled: true, cogsAmount: 1200 });
    expect(report.overview).toMatchObject({
      grossSales: 3200,
      discounts: 200,
      netSales: 3000,
      shippingCollected: 500,
      paymentFees: 130,
      providerCogs: 1200,
      contribution: 2170,
      unreconciledCount: 0,
    });
    expect(report.close.sourceDigest).toMatch(/^[a-f0-9]{64}$/);
  });

  it('keeps missing historical COGS visibly unreconciled', async () => {
    mocks.ledgerFind.mockResolvedValue([
      row('sale', 'product_sale', 3200),
      row('discount', 'discount', -200),
      row('shipping', 'shipping_income', 500),
    ]);
    const report = await loadFinanceReport(period);
    expect(report.reconciliation[0]?.issues).toContain('COGS_NOT_CAPTURED');
    expect(report.overview.unreconciledValue).toBe(3500);
    expect(report.close.ready).toBe(false);
  });

  it('validates report periods and emits provenance in XLSX-ready CSV', () => {
    expect(parseFinancePeriod(new URLSearchParams('year=2026')).from.toISOString()).toBe(
      '2026-01-01T00:00:00.000Z',
    );
    expect(() => parseFinancePeriod(new URLSearchParams('from=2026-12-31&to=2026-01-01'))).toThrow(
      'Invalid finance period',
    );
    const csv = rowsToCsv([{ amount: 100, source: 'Order' }], {
      period: '2026',
      provenance: 'canonical',
    });
    expect(csv).toContain('# provenance: canonical');
    expect(csv).toContain('amount,source');
  });

  it('selects the unresolved reconciliation export without hiding known gaps', async () => {
    mocks.ledgerFind.mockResolvedValue([row('sale', 'product_sale', 3000)]);
    const report = await loadFinanceReport(period);
    expect(selectExportRows(report, 'unresolved-reconciliation')).toHaveLength(1);
  });
});
