import 'server-only';

import { TaxLedgerEntryType, type Prisma } from '@prisma/client';
import type Stripe from 'stripe';
import { db as prisma } from '@/lib/db';
import {
  amountFromStripeSession,
  calculateOrderEconomics,
  economicsMetadata,
  jurisdictionFromStripeSession,
  ledgerAmountsFromEconomics,
  normalizeCurrency,
  normalizeProviderCosts,
  type ProviderCostInput,
} from '@/lib/accounting/order-economics';

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
  const occurredAt = new Date();
  const discount = amountFromStripeSession(session, 'amount_discount');
  const shipping = amountFromStripeSession(session, 'amount_shipping');
  const tax = amountFromStripeSession(session, 'amount_tax');
  const subtotal = session.amount_subtotal ?? session.amount_total ?? 0;
  const grossRevenue = session.amount_total ?? subtotal + shipping + tax - discount;
  const economics = calculateOrderEconomics({
    orderId,
    grossRevenueCents: grossRevenue,
    subtotalCents: subtotal,
    discountAmountCents: discount,
    shippingCollectedCents: shipping,
    taxCollectedCents: tax,
    stripeFeeCents,
    providerProductionCostCents: 0,
    providerShippingCostCents: 0,
    refundAmountCents: 0,
    currency: session.currency ?? 'usd',
    jurisdiction: jurisdictionFromStripeSession(session),
    sourceProvider: 'stripe',
    sourceEventId,
    sourceReference: session.id,
    occurredAt,
    stripeFeeKnown,
    providerCostsKnown: false,
  });
  const snapshotMetadata = economicsMetadata(economics);
  const base = {
    orderId,
    currency: economics.currency,
    customerJurisdiction: economics.customerJurisdiction,
    sourceProvider: 'stripe',
    sourceEventId,
    sourceReference: session.id,
    occurredAt,
  } satisfies Omit<LedgerEntryInput, 'entryType' | 'amountCents'>;

  return ledgerAmountsFromEconomics(economics).map((entry) => {
    if (entry.entryType === TaxLedgerEntryType.STRIPE_FEE) {
      return {
        ...base,
        ...entry,
        metadata: toPrismaJsonValue({ known: stripeFeeKnown, chargeId, economics: snapshotMetadata }),
      };
    }

    if (
      entry.entryType === TaxLedgerEntryType.PROVIDER_PRODUCTION_COST ||
      entry.entryType === TaxLedgerEntryType.PROVIDER_SHIPPING_COST
    ) {
      return {
        ...base,
        ...entry,
        metadata: toPrismaJsonValue({ known: false, reason: 'pending_provider_result' }),
      };
    }

    if (entry.entryType === TaxLedgerEntryType.NET_REVENUE_ESTIMATE) {
      return {
        ...base,
        ...entry,
        metadata: toPrismaJsonValue(snapshotMetadata),
      };
    }

    return { ...base, ...entry };
  });
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

  return prisma.taxLedgerEntry.upsert({
    where: { idempotencyKey },
    update: {},
    create: {
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

export async function recordProviderCostLedger({
  orderId,
  providerCosts,
  occurredAt = new Date(),
}: {
  orderId: string;
  providerCosts: ProviderCostInput;
  occurredAt?: Date;
}) {
  const costs = normalizeProviderCosts(providerCosts);
  if (costs.costKnown && !costs.sourceEventId && !costs.sourceReference) {
    throw new Error('Known provider costs require a stable source event or reference');
  }

  const base = {
    orderId,
    currency: costs.currency,
    sourceProvider: costs.provider,
    sourceEventId: costs.sourceEventId,
    sourceReference: costs.sourceReference,
    occurredAt,
  } satisfies Omit<LedgerEntryInput, 'entryType' | 'amountCents'>;

  return appendLedgerEntries([
    {
      ...base,
      entryType: TaxLedgerEntryType.PROVIDER_PRODUCTION_COST,
      amountCents: -costs.productionCostCents,
      metadata: costs.metadata ?? toPrismaJsonValue({ known: costs.costKnown }),
    },
    {
      ...base,
      entryType: TaxLedgerEntryType.PROVIDER_SHIPPING_COST,
      amountCents: -costs.shippingCostCents,
      metadata: costs.metadata ?? toPrismaJsonValue({ known: costs.costKnown }),
    },
  ]);
}

export async function recordBusinessExpenseLedger({
  businessExpenseId,
  orderId,
  amountCents,
  currency,
  sourceProvider,
  sourceEventId,
  sourceReference,
  occurredAt = new Date(),
  metadata,
}: {
  businessExpenseId: string;
  orderId?: string | null;
  amountCents: number;
  currency: string;
  sourceProvider: string;
  sourceEventId?: string | null;
  sourceReference?: string | null;
  occurredAt?: Date;
  metadata?: Prisma.InputJsonValue;
}) {
  return appendLedgerEntry({
    orderId,
    businessExpenseId,
    entryType: TaxLedgerEntryType.BUSINESS_EXPENSE,
    amountCents: -Math.abs(amountCents),
    currency: normalizeCurrency(currency),
    sourceProvider,
    sourceEventId,
    sourceReference,
    occurredAt,
    metadata,
  });
}
