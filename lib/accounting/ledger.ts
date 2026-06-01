import 'server-only';

import { TaxLedgerEntryType, type Prisma } from '@prisma/client';
import type Stripe from 'stripe';
import { db as prisma } from '@/lib/db';

type LedgerSource = {
  orderId?: string | null;
  entryType: TaxLedgerEntryType;
  sourceEventId?: string | null;
  sourceReference?: string | null;
  providerReference?: string | null;
};

export type LedgerEntryInput = {
  orderId?: string | null;
  businessExpenseId?: string | null;
  entryType: TaxLedgerEntryType;
  amountCents: number;
  currency: string;
  customerJurisdiction?: string | null;
  sourceProvider: string;
  sourceEventId?: string | null;
  sourceReference?: string | null;
  reversalOfEntryId?: string | null;
  occurredAt: Date;
  metadata?: Prisma.InputJsonValue;
};

export type StripePaymentAccounting = {
  stripeFeeCents: number;
  stripeFeeKnown: boolean;
  chargeId: string | null;
};

const ZERO_ENTRY_TYPES = new Set<TaxLedgerEntryType>([
  TaxLedgerEntryType.DISCOUNT,
  TaxLedgerEntryType.SHIPPING_CHARGED,
  TaxLedgerEntryType.TAX_COLLECTED,
  TaxLedgerEntryType.STRIPE_FEE,
  TaxLedgerEntryType.REFUND,
  TaxLedgerEntryType.PROVIDER_PRODUCTION_COST,
  TaxLedgerEntryType.PROVIDER_SHIPPING_COST,
]);

export function buildLedgerIdempotencyKey({
  orderId,
  entryType,
  sourceEventId,
  sourceReference,
  providerReference,
}: LedgerSource) {
  return [
    orderId || 'unlinked',
    entryType,
    sourceEventId || 'no-event',
    providerReference || sourceReference || 'no-reference',
  ].join(':');
}

function toPrismaJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? {})) as Prisma.InputJsonValue;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function customerJurisdictionFromSession(session: Stripe.Checkout.Session) {
  const sessionRecord = asRecord(session);
  const shippingDetails = asRecord(sessionRecord.shipping_details);
  const customerDetails = asRecord(session.customer_details);
  const address = asRecord(shippingDetails.address ?? customerDetails.address);
  const parts = [address.country, address.state, address.postal_code].filter(Boolean);
  return parts.length > 0 ? parts.join('-') : null;
}

function amountFromSession(
  session: Stripe.Checkout.Session,
  key: 'amount_discount' | 'amount_shipping' | 'amount_tax',
) {
  const value = asRecord(session.total_details)[key];
  return typeof value === 'number' ? value : 0;
}

export function buildStripePaidOrderLedgerEntries({
  orderId,
  session,
  sourceEventId,
  stripeFeeCents,
  stripeFeeKnown,
  chargeId,
}: {
  orderId: string;
  session: Stripe.Checkout.Session;
  sourceEventId: string;
  stripeFeeCents: number;
  stripeFeeKnown: boolean;
  chargeId?: string | null;
}): LedgerEntryInput[] {
  const currency = (session.currency ?? 'usd').toUpperCase();
  const occurredAt = new Date();
  const saleGross = session.amount_subtotal ?? session.amount_total ?? 0;
  const discount = amountFromSession(session, 'amount_discount');
  const shipping = amountFromSession(session, 'amount_shipping');
  const tax = amountFromSession(session, 'amount_tax');
  const refund = 0;
  const providerProductionCost = 0;
  const providerShippingCost = 0;
  const netRevenueEstimate =
    (session.amount_total ?? saleGross + shipping + tax - discount) -
    stripeFeeCents -
    refund -
    providerProductionCost -
    providerShippingCost;
  const customerJurisdiction = customerJurisdictionFromSession(session);
  const base = {
    orderId,
    currency,
    customerJurisdiction,
    sourceProvider: 'stripe',
    sourceEventId,
    sourceReference: session.id,
    occurredAt,
  } satisfies Omit<LedgerEntryInput, 'entryType' | 'amountCents'>;

  return [
    { ...base, entryType: TaxLedgerEntryType.SALE_GROSS, amountCents: saleGross },
    { ...base, entryType: TaxLedgerEntryType.DISCOUNT, amountCents: -Math.abs(discount) },
    { ...base, entryType: TaxLedgerEntryType.SHIPPING_CHARGED, amountCents: shipping },
    { ...base, entryType: TaxLedgerEntryType.TAX_COLLECTED, amountCents: tax },
    {
      ...base,
      entryType: TaxLedgerEntryType.STRIPE_FEE,
      amountCents: -Math.abs(stripeFeeCents),
      metadata: toPrismaJsonValue({ known: stripeFeeKnown, chargeId }),
    },
    { ...base, entryType: TaxLedgerEntryType.REFUND, amountCents: -Math.abs(refund) },
    {
      ...base,
      entryType: TaxLedgerEntryType.PROVIDER_PRODUCTION_COST,
      amountCents: -Math.abs(providerProductionCost),
      metadata: toPrismaJsonValue({ known: false, reason: 'pending_provider_result' }),
    },
    {
      ...base,
      entryType: TaxLedgerEntryType.PROVIDER_SHIPPING_COST,
      amountCents: -Math.abs(providerShippingCost),
      metadata: toPrismaJsonValue({ known: false, reason: 'pending_provider_result' }),
    },
    {
      ...base,
      entryType: TaxLedgerEntryType.NET_REVENUE_ESTIMATE,
      amountCents: netRevenueEstimate,
      metadata: toPrismaJsonValue({ stripeFeeKnown, providerCostsKnown: false }),
    },
  ];
}

export async function appendLedgerEntry(input: LedgerEntryInput) {
  if (input.amountCents === 0 && !ZERO_ENTRY_TYPES.has(input.entryType)) {
    return null;
  }

  const idempotencyKey = buildLedgerIdempotencyKey({
    orderId: input.orderId,
    entryType: input.entryType,
    sourceEventId: input.sourceEventId,
    sourceReference: input.sourceReference,
  });

  const existing = await prisma.taxLedgerEntry.findUnique({ where: { idempotencyKey } });
  if (existing) return existing;

  return prisma.taxLedgerEntry.create({
    data: {
      orderId: input.orderId ?? undefined,
      businessExpenseId: input.businessExpenseId ?? undefined,
      entryType: input.entryType,
      amountCents: input.amountCents,
      currency: input.currency,
      customerJurisdiction: input.customerJurisdiction ?? undefined,
      sourceProvider: input.sourceProvider,
      sourceEventId: input.sourceEventId ?? undefined,
      sourceReference: input.sourceReference ?? undefined,
      idempotencyKey,
      reversalOfEntryId: input.reversalOfEntryId ?? undefined,
      occurredAt: input.occurredAt,
      metadata: input.metadata ?? undefined,
    },
  });
}

export async function appendLedgerEntries(entries: LedgerEntryInput[]) {
  const results = [];
  for (const entry of entries) {
    results.push(await appendLedgerEntry(entry));
  }
  return results;
}

export async function resolveStripePaymentAccounting(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<StripePaymentAccounting> {
  const paymentIntentId =
    typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
  if (!paymentIntentId) {
    return { stripeFeeCents: 0, stripeFeeKnown: false, chargeId: null };
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['latest_charge.balance_transaction'],
    });
    const latestCharge = paymentIntent.latest_charge;
    if (!latestCharge || typeof latestCharge === 'string') {
      return { stripeFeeCents: 0, stripeFeeKnown: false, chargeId: null };
    }

    const balanceTransaction = latestCharge.balance_transaction;
    const fee =
      balanceTransaction && typeof balanceTransaction !== 'string'
        ? balanceTransaction.fee ?? 0
        : 0;

    return {
      stripeFeeCents: fee,
      stripeFeeKnown: Boolean(balanceTransaction && typeof balanceTransaction !== 'string'),
      chargeId: latestCharge.id,
    };
  } catch {
    return { stripeFeeCents: 0, stripeFeeKnown: false, chargeId: null };
  }
}

export async function recordStripePaidOrderLedger({
  orderId,
  session,
  sourceEventId,
  stripeFeeCents,
  stripeFeeKnown,
  chargeId,
}: {
  orderId: string;
  session: Stripe.Checkout.Session;
  sourceEventId: string;
  stripeFeeCents: number;
  stripeFeeKnown: boolean;
  chargeId?: string | null;
}) {
  return appendLedgerEntries(
    buildStripePaidOrderLedgerEntries({
      orderId,
      session,
      sourceEventId,
      stripeFeeCents,
      stripeFeeKnown,
      chargeId,
    }),
  );
}

export async function recordStripeRefundLedger({
  orderId,
  currency,
  amountRefunded,
  sourceEventId,
  sourceReference,
  occurredAt = new Date(),
}: {
  orderId: string;
  currency: string;
  amountRefunded: number;
  sourceEventId: string;
  sourceReference: string;
  occurredAt?: Date;
}) {
  return appendLedgerEntry({
    orderId,
    entryType: TaxLedgerEntryType.REFUND,
    amountCents: -Math.abs(amountRefunded),
    currency: currency.toUpperCase(),
    sourceProvider: 'stripe',
    sourceEventId,
    sourceReference,
    occurredAt,
  });
}
