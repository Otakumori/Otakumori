import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { resolveCatalogProvider } from '@/lib/catalog/provider';

export type PaidOrderLedgerInput = {
  orderId: string;
  stripeSessionId: string;
  chargeId: string | null;
  paymentIntentId: string | null;
  jurisdiction: { country: string | null; state: string | null };
  stripeFee?: { amount: number; balanceTransactionId: string } | null;
};

type LedgerCreate = Prisma.FinancialTransactionUncheckedCreateInput;

function cents(value: number | null | undefined) {
  return Number.isInteger(value) ? Number(value) : 0;
}

async function createOnce(data: LedgerCreate) {
  try {
    return await db.financialTransaction.create({ data });
  } catch (error) {
    if ((error as { code?: string })?.code === 'P2002') {
      return db.financialTransaction.findUnique({ where: { id: data.id } });
    }
    throw error;
  }
}

export async function capturePaidOrderLedger(input: PaidOrderLedgerInput) {
  const order = await db.order.findUnique({
    where: { id: input.orderId },
    include: {
      OrderItem: {
        orderBy: { createdAt: 'asc' },
        include: {
          Product: { select: { integrationRef: true, printifyProductId: true } },
          ProductVariant: {
            select: { id: true, costCents: true, currency: true, providerVariantId: true },
          },
        },
      },
    },
  });
  if (!order) throw new Error(`Cannot capture ledger for missing order ${input.orderId}`);

  const currency = order.currency.toUpperCase();
  const discount = cents(order.discountAmount);
  const source = {
    authority: 'stripe_checkout',
    stripeSessionId: input.stripeSessionId,
    paymentIntentId: input.paymentIntentId,
    jurisdiction: input.jurisdiction,
  };

  const rows: LedgerCreate[] = [
    {
      id: `finance:order:${order.id}:sale`,
      orderId: order.id,
      type: 'sale',
      amount: order.subtotalCents,
      currency,
      description: `Merchandise sale for order ${order.displayNumber}`,
      category: 'product_sale',
      stripeChargeId: input.chargeId,
      metadata: source as Prisma.InputJsonObject,
      createdAt: order.paidAt ?? new Date(),
    },
  ];

  if (discount > 0) {
    rows.push({
      id: `finance:order:${order.id}:discount`,
      orderId: order.id,
      type: 'adjustment',
      amount: -discount,
      currency,
      description: `Discount applied to order ${order.displayNumber}`,
      category: 'discount',
      stripeChargeId: input.chargeId,
      metadata: source as Prisma.InputJsonObject,
      createdAt: order.paidAt ?? new Date(),
    });
  }

  const shipping = cents(order.shippingAmount);
  if (shipping > 0) {
    rows.push({
      id: `finance:order:${order.id}:shipping-income`,
      orderId: order.id,
      type: 'shipping',
      amount: shipping,
      currency,
      description: `Shipping collected for order ${order.displayNumber}`,
      category: 'shipping_income',
      stripeChargeId: input.chargeId,
      metadata: source as Prisma.InputJsonObject,
      createdAt: order.paidAt ?? new Date(),
    });
  }

  const tax = cents(order.taxAmount);
  if (tax > 0) {
    rows.push({
      id: `finance:order:${order.id}:tax-collected`,
      orderId: order.id,
      type: 'tax',
      amount: tax,
      currency,
      description: `Tax collected for order ${order.displayNumber}`,
      category: 'tax_collected',
      stripeChargeId: input.chargeId,
      metadata: source as Prisma.InputJsonObject,
      createdAt: order.paidAt ?? new Date(),
    });
  }

  const cogsItems = order.OrderItem.map((item) => ({
    orderItemId: item.id,
    productVariantId: item.ProductVariant.id,
    provider: resolveCatalogProvider(item.Product),
    providerVariantId: item.ProductVariant.providerVariantId,
    unitCostCents: item.ProductVariant.costCents,
    quantity: item.quantity,
    currency: (item.ProductVariant.currency ?? currency).toUpperCase(),
  }));
  const missingCostItemIds = cogsItems
    .filter((item) => !Number.isInteger(item.unitCostCents))
    .map((item) => item.orderItemId);
  const cogsKnown = missingCostItemIds.length === 0;
  const cogsTotal = cogsKnown
    ? cogsItems.reduce((sum, item) => sum + Number(item.unitCostCents) * item.quantity, 0)
    : 0;
  rows.push({
    id: `finance:order:${order.id}:provider-cogs`,
    orderId: order.id,
    type: cogsKnown ? 'fee' : 'adjustment',
    amount: cogsKnown ? -cogsTotal : 0,
    currency,
    description: cogsKnown
      ? `Provider COGS snapshot for order ${order.displayNumber}`
      : `Provider COGS unknown for order ${order.displayNumber}`,
    category: cogsKnown ? 'provider_cogs' : 'provider_cogs_unknown',
    metadata: {
      authority: 'order_time_catalog_snapshot',
      status: cogsKnown ? 'KNOWN' : 'UNKNOWN',
      capturedAt: new Date().toISOString(),
      items: cogsItems,
      missingCostItemIds,
    } as Prisma.InputJsonObject,
    createdAt: order.paidAt ?? new Date(),
  });

  if (input.stripeFee && input.stripeFee.amount >= 0) {
    rows.push({
      id: `finance:stripe-balance:${input.stripeFee.balanceTransactionId}:fee`,
      orderId: order.id,
      type: 'fee',
      amount: -input.stripeFee.amount,
      currency,
      description: `Stripe processing fee for order ${order.displayNumber}`,
      category: 'payment_processing',
      stripeChargeId: input.chargeId,
      metadata: {
        authority: 'stripe_balance_transaction',
        balanceTransactionId: input.stripeFee.balanceTransactionId,
      },
      createdAt: order.paidAt ?? new Date(),
    });
  }

  await Promise.all(rows.map(createOnce));
  return { rows: rows.length, cogsStatus: cogsKnown ? ('KNOWN' as const) : ('UNKNOWN' as const) };
}

export async function reconcileRefundLedger(input: {
  orderId: string;
  chargeId: string;
  amountRefunded: number;
  currency: string;
  occurredAt: Date;
}) {
  const id = `finance:stripe-charge:${input.chargeId}:refund-total`;
  return db.financialTransaction.upsert({
    where: { id },
    update: {
      amount: -Math.max(0, input.amountRefunded),
      currency: input.currency.toUpperCase(),
      metadata: {
        authority: 'stripe_charge',
        reconciliationShape: 'cumulative_refund_total',
        capturedAt: input.occurredAt.toISOString(),
      },
    },
    create: {
      id,
      orderId: input.orderId,
      type: 'refund',
      amount: -Math.max(0, input.amountRefunded),
      currency: input.currency.toUpperCase(),
      description: `Cumulative Stripe refunds for charge ${input.chargeId}`,
      category: 'refund',
      stripeChargeId: input.chargeId,
      metadata: {
        authority: 'stripe_charge',
        reconciliationShape: 'cumulative_refund_total',
        capturedAt: input.occurredAt.toISOString(),
      },
      createdAt: input.occurredAt,
    },
  });
}
