import ExcelJS from 'exceljs';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { buildFinanceWorkbook, spreadsheetSafeText } from '@/lib/finance/xlsx';

function fixtureReport() {
  const now = new Date('2026-10-15T12:00:00.000Z');
  return {
    period: { from: new Date('2026-10-01'), to: new Date('2026-10-31'), label: 'October 2026' },
    overview: {
      grossSales: 10000,
      refunds: 2500,
      netSales: 7500,
      discounts: 0,
      shippingCollected: 1000,
      shippingExpense: null,
      taxCollected: 625,
      paymentFees: 450,
      providerCogs: 3200,
      operatingExpenses: 300,
      contribution: 4550,
      transactionCount: 7,
      orderCount: 1,
      unreconciledCount: 1,
      unreconciledValue: 10000,
    },
    orders: [
      {
        id: 'order_1',
        displayNumber: 42,
        createdAt: now,
        updatedAt: now,
        paidAt: now,
        status: 'paid',
        stripeId: 'cs_1',
        paymentIntentId: 'pi_1',
        chargeId: 'ch_1',
        printifyId: null,
        totalAmount: 10000,
        subtotalCents: 10000,
        discountAmount: 0,
        shippingAmount: 1000,
        taxAmount: 625,
        refundAmount: 2500,
        currency: 'USD',
        OrderItem: [
          { id: 'item_1', name: '=UNTRUSTED()', quantity: 1, unitAmount: 10000, sku: '+SKU' },
        ],
        PrintifyOrderSync: { printifyOrderId: 'po_1', status: 'accepted', error: null },
      },
    ],
    ledger: [
      {
        id: 'sale',
        orderId: 'order_1',
        type: 'sale',
        category: 'product_sale',
        amount: 10000,
        currency: 'USD',
        description: '@unsafe',
        stripeChargeId: 'ch_1',
        stripeRefundId: null,
        metadata: {},
        createdAt: now,
      },
      {
        id: 'refund',
        orderId: 'order_1',
        type: 'refund',
        category: 'refund',
        amount: -2500,
        currency: 'USD',
        description: 'Partial refund',
        stripeChargeId: 'ch_1',
        stripeRefundId: 're_1',
        metadata: {},
        createdAt: now,
      },
      {
        id: 'fee',
        orderId: 'order_1',
        type: 'fee',
        category: 'payment_processing',
        amount: -450,
        currency: 'USD',
        description: 'Processor fee',
        stripeChargeId: 'ch_1',
        stripeRefundId: null,
        metadata: {},
        createdAt: now,
      },
      {
        id: 'cogs',
        orderId: 'order_1',
        type: 'fee',
        category: 'provider_cogs_unknown',
        amount: 0,
        currency: 'USD',
        description: 'Missing cost',
        stripeChargeId: 'ch_1',
        stripeRefundId: null,
        metadata: {},
        createdAt: now,
      },
    ],
    reconciliation: [
      {
        orderId: 'order_1',
        orderNumber: 42,
        createdAt: now,
        paidAt: now,
        status: 'paid',
        provider: 'printify',
        stripeSessionId: 'cs_1',
        paymentIntentId: 'pi_1',
        chargeId: 'ch_1',
        providerOrderId: 'po_1',
        localTotal: 10000,
        ledgerRevenue: 10000,
        refundAmount: 2500,
        ledgerRefund: 2500,
        cogsAmount: null,
        issues: ['COGS_UNKNOWN'],
        financialScope: 'PAID_ORDER',
        reconciled: false,
      },
    ],
    tax: {
      readiness: { status: 'BLOCKED' },
      registrations: [],
      jurisdictionRows: [
        {
          country: 'US',
          state: 'MA',
          salesCents: 10000,
          taxCollectedCents: 625,
          orderCount: 1,
          authority: 'stripe_checkout_shipping_address',
          taxReadiness: 'BLOCKED',
          taxCodes: ['txcd_99999999'],
          registrationState: 'unverified',
          refundAdjustmentCents: 0,
        },
      ],
    },
    close: { ready: false, sourceDigest: 'digest', blockers: ['COGS unknown'] },
    methodology: {
      merchantAccountId: 'acct_1RwMJgHN4OLBC1u4',
      reportingEnvironment: 'test',
      timezone: 'America/New_York',
      accountingMethod: 'cash',
      reportVersion: '1.0.0',
      generatedAt: now.toISOString(),
      sources: ['Order', 'FinancialTransaction'],
      limitations: ['Fixture limitation'],
    },
  };
}

describe('financial XLSX generation', () => {
  it('builds every required worksheet with traceable formulas and escaped text', async () => {
    const buffer = await buildFinanceWorkbook(fixtureReport() as never);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual([
      'Executive Summary',
      'Transactions',
      'Orders & Items',
      'Taxes by Jurisdiction',
      'Refunds & Disputes',
      'Fees & Payouts',
      'Fulfillment & COGS',
      'Expenses',
      'Reconciliation',
      'Tax Preparation',
      'Source & Methodology',
    ]);
    expect(workbook.getWorksheet('Executive Summary')?.getCell('B16').value).toMatchObject({
      formula: 'B10+B12+B13+B14+B15',
    });
    expect(workbook.getWorksheet('Orders & Items')?.getCell('G2').value).toBe("'=UNTRUSTED()");
    expect(workbook.getWorksheet('Transactions')?.getCell('J2').value).toBe("'@unsafe");
  });

  it('neutralizes spreadsheet formula injection without changing normal text', () => {
    expect(spreadsheetSafeText('=2+2')).toBe("'=2+2");
    expect(spreadsheetSafeText('+cmd')).toBe("'+cmd");
    expect(spreadsheetSafeText('sakura')).toBe('sakura');
  });
});
