import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  orderFind: vi.fn(),
  transactionCreate: vi.fn(),
  transactionFind: vi.fn(),
  transactionUpsert: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    order: { findUnique: mocks.orderFind },
    financialTransaction: {
      create: mocks.transactionCreate,
      findUnique: mocks.transactionFind,
      upsert: mocks.transactionUpsert,
    },
  },
}));

import { capturePaidOrderLedger, reconcileRefundLedger } from '@/lib/finance/ledger';

function paidOrder(costCents: number | null = 900) {
  return {
    id: 'order_1',
    displayNumber: 42,
    currency: 'USD',
    subtotalCents: 3000,
    discountAmount: 200,
    shippingAmount: 500,
    taxAmount: 0,
    paidAt: new Date('2026-10-01T00:00:00.000Z'),
    OrderItem: [
      {
        id: 'item_1',
        quantity: 2,
        Product: { integrationRef: 'printify', printifyProductId: 'provider_product' },
        ProductVariant: {
          id: 'variant_1',
          costCents,
          currency: 'USD',
          providerVariantId: 'provider_variant',
        },
      },
    ],
  };
}

describe('finance ledger authority', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.orderFind.mockResolvedValue(paidOrder());
    mocks.transactionCreate.mockImplementation(async ({ data }) => data);
    mocks.transactionFind.mockResolvedValue({ id: 'existing' });
    mocks.transactionUpsert.mockResolvedValue({ id: 'refund' });
  });

  it('captures sale, shipping, fee, and immutable provider COGS facts', async () => {
    const result = await capturePaidOrderLedger({
      orderId: 'order_1',
      stripeSessionId: 'cs_1',
      chargeId: 'ch_1',
      paymentIntentId: 'pi_1',
      jurisdiction: { country: 'US', state: 'NY' },
      stripeFee: { amount: 123, balanceTransactionId: 'txn_1' },
    });

    expect(result).toEqual({ rows: 5, cogsStatus: 'KNOWN' });
    expect(mocks.transactionCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: 'finance:order:order_1:provider-cogs',
        amount: -1800,
        category: 'provider_cogs',
        metadata: expect.objectContaining({ status: 'KNOWN' }),
      }),
    });
    expect(mocks.transactionCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: 'finance:stripe-balance:txn_1:fee',
        amount: -123,
        category: 'payment_processing',
      }),
    });
  });

  it('freezes missing provider cost as unknown instead of using a later catalog value', async () => {
    mocks.orderFind.mockResolvedValue(paidOrder(null));
    const result = await capturePaidOrderLedger({
      orderId: 'order_1',
      stripeSessionId: 'cs_1',
      chargeId: 'ch_1',
      paymentIntentId: 'pi_1',
      jurisdiction: { country: null, state: null },
    });

    expect(result.cogsStatus).toBe('UNKNOWN');
    expect(mocks.transactionCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: 'finance:order:order_1:provider-cogs',
        amount: 0,
        category: 'provider_cogs_unknown',
        metadata: expect.objectContaining({ status: 'UNKNOWN', missingCostItemIds: ['item_1'] }),
      }),
    });
  });

  it('uses deterministic IDs and treats a unique conflict as an idempotent replay', async () => {
    mocks.transactionCreate.mockRejectedValue({ code: 'P2002' });
    await expect(
      capturePaidOrderLedger({
        orderId: 'order_1',
        stripeSessionId: 'cs_1',
        chargeId: 'ch_1',
        paymentIntentId: 'pi_1',
        jurisdiction: { country: 'US', state: 'NY' },
      }),
    ).resolves.toEqual({ rows: 4, cogsStatus: 'KNOWN' });
    expect(mocks.transactionFind).toHaveBeenCalledWith({
      where: { id: 'finance:order:order_1:sale' },
    });
  });

  it('reconciles cumulative Stripe refunds through one charge-scoped row', async () => {
    await reconcileRefundLedger({
      orderId: 'order_1',
      chargeId: 'ch_1',
      amountRefunded: 1500,
      currency: 'usd',
      occurredAt: new Date('2026-10-02T00:00:00.000Z'),
    });
    expect(mocks.transactionUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'finance:stripe-charge:ch_1:refund-total' },
        update: expect.objectContaining({ amount: -1500, currency: 'USD' }),
        create: expect.objectContaining({ amount: -1500, category: 'refund' }),
      }),
    );
  });
});
