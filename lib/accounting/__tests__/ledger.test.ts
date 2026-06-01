import { describe, expect, it, vi } from 'vitest';
import { TaxLedgerEntryType } from '@prisma/client';

vi.mock('@/lib/db', () => ({
  db: {
    taxLedgerEntry: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import {
  buildLedgerIdempotencyKey,
  buildStripePaidOrderLedgerEntries,
} from '@/lib/accounting/ledger';

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
  });
});
