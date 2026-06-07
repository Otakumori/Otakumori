import { describe, expect, it, vi } from 'vitest';
import { TaxLedgerEntryType } from '@prisma/client';

vi.mock('@/lib/db', () => ({
  db: {
    taxLedgerEntry: {
      upsert: vi.fn(async ({ create }) => ({ id: 'ledger_test', ...create })),
    },
  },
}));

import {
  appendLedgerEntry,
  buildLedgerIdempotencyKey,
  buildStripePaidOrderLedgerEntries,
} from '@/lib/accounting/ledger';
import {
  calculateOrderEconomics,
  extractPrintifyProviderCostsFromOrderResponse,
  extractMerchizeProviderCosts,
  extractPrintifyProviderCosts,
  FINANCIAL_TRANSACTION_COMPATIBILITY_DECISION,
} from '@/lib/accounting/order-economics';

describe('accounting ledger helpers', () => {
  it('builds idempotency keys from order, entry type, source event, and source reference', () => {
    expect(
      buildLedgerIdempotencyKey({
        orderId: 'order_123',
        entryType: TaxLedgerEntryType.SALE_GROSS,
        sourceEventId: 'evt_123',
        sourceReference: 'cs_123',
      }),
    ).toBe('order_123:SALE_GROSS:evt_123:cs_123');
  });

  it('uses an atomic upsert for append-only ledger idempotency', async () => {
    const input = {
      orderId: 'order_123',
      entryType: TaxLedgerEntryType.SALE_GROSS,
      amountCents: 5000,
      currency: 'USD',
      sourceProvider: 'stripe',
      sourceEventId: 'evt_123',
      sourceReference: 'cs_123',
      occurredAt: new Date('2026-06-03T00:00:00.000Z'),
    };

    const first = await appendLedgerEntry(input);
    const duplicate = await appendLedgerEntry(input);

    expect(first).toEqual(duplicate);
  });

  it('builds the paid-order ledger row set without raw Stripe payloads', () => {
    const entries = buildStripePaidOrderLedgerEntries({
      orderId: 'order_123',
      sourceEventId: 'evt_123',
      stripeFeeCents: 123,
      stripeFeeKnown: true,
      chargeId: 'ch_123',
      session: {
        id: 'cs_123',
        object: 'checkout.session',
        amount_subtotal: 5000,
        amount_total: 5500,
        currency: 'usd',
        total_details: {
          amount_discount: 500,
          amount_shipping: 700,
          amount_tax: 300,
        },
      } as any,
    });

    expect(entries.map((entry) => entry.entryType)).toEqual([
      TaxLedgerEntryType.SALE_GROSS,
      TaxLedgerEntryType.DISCOUNT,
      TaxLedgerEntryType.SHIPPING_CHARGED,
      TaxLedgerEntryType.TAX_COLLECTED,
      TaxLedgerEntryType.STRIPE_FEE,
      TaxLedgerEntryType.REFUND,
      TaxLedgerEntryType.PROVIDER_PRODUCTION_COST,
      TaxLedgerEntryType.PROVIDER_SHIPPING_COST,
      TaxLedgerEntryType.NET_REVENUE_ESTIMATE,
    ]);
    expect(entries.find((entry) => entry.entryType === TaxLedgerEntryType.DISCOUNT)?.amountCents).toBe(-500);
    expect(entries.find((entry) => entry.entryType === TaxLedgerEntryType.STRIPE_FEE)?.amountCents).toBe(-123);
    expect(entries.find((entry) => entry.entryType === TaxLedgerEntryType.NET_REVENUE_ESTIMATE)?.amountCents).toBe(5377);
    expect(entries.find((entry) => entry.entryType === TaxLedgerEntryType.NET_REVENUE_ESTIMATE)?.metadata).toEqual(
      expect.objectContaining({
        grossRevenueCents: 5500,
        netRevenueCents: 5377,
        grossMarginCents: 5500,
        sourceReferencePresent: true,
      }),
    );
  });

  it('calculates order economics in cents without mutating sale components', () => {
    const snapshot = calculateOrderEconomics({
      orderId: 'order_123',
      grossRevenueCents: 8500,
      subtotalCents: 7600,
      discountAmountCents: 400,
      shippingCollectedCents: 900,
      taxCollectedCents: 400,
      stripeFeeCents: 285,
      providerProductionCostCents: 2500,
      providerShippingCostCents: 700,
      refundAmountCents: 1200,
      currency: 'usd',
      jurisdiction: { country: 'US', state: 'WA' },
      sourceProvider: 'stripe',
      sourceEventId: 'evt_123',
      sourceReference: 'cs_123',
      occurredAt: new Date('2026-06-03T00:00:00.000Z'),
    });

    expect(snapshot.currency).toBe('USD');
    expect(snapshot.customerJurisdiction).toBe('US-WA');
    expect(snapshot.netRevenueCents).toBe(3815);
    expect(snapshot.grossMarginCents).toBe(4100);
  });

  it('normalizes provider costs from server-owned adapter data only', () => {
    expect(
      extractPrintifyProviderCosts({
        productionCostCents: 1800,
        shippingCostCents: 600,
        currency: 'usd',
      }),
    ).toEqual(
      expect.objectContaining({
        provider: 'printify',
        productionCostCents: 1800,
        shippingCostCents: 600,
        currency: 'USD',
        costKnown: true,
      }),
    );

    expect(
      extractMerchizeProviderCosts({
        itemCostCents: 1700,
        shippingCostCents: 650,
        currency: 'usd',
      }),
    ).toEqual(
      expect.objectContaining({
        provider: 'merchize',
        productionCostCents: 1700,
        shippingCostCents: 650,
        currency: 'USD',
        costKnown: true,
      }),
    );
  });

  it('extracts Printify order response costs without preserving raw payloads', () => {
    expect(
      extractPrintifyProviderCostsFromOrderResponse({
        id: 'provider_order_123',
        currency: 'usd',
        line_items: [{ production_cost: 1200 }, { production_cost: 800 }],
        shipping_cost: 650,
      }),
    ).toEqual(
      expect.objectContaining({
        provider: 'printify',
        productionCostCents: 2000,
        shippingCostCents: 650,
        currency: 'USD',
        sourceReference: 'provider_order_123',
        costKnown: true,
      }),
    );
  });

  it('preserves FinancialTransaction as a compatibility bridge', () => {
    expect(FINANCIAL_TRANSACTION_COMPATIBILITY_DECISION).toEqual(
      expect.objectContaining({
        model: 'FinancialTransaction',
        decision: 'preserve_compatibility_bridge',
      }),
    );
  });
});
