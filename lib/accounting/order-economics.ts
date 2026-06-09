import 'server-only';

import { TaxLedgerEntryType, type Prisma } from '@prisma/client';
import type Stripe from 'stripe';

export type MoneyCents = number;

export type CustomerJurisdiction = {
  country?: string | null;
  state?: string | null;
  postalCode?: string | null;
};

export type ProviderCostInput = {
  provider: 'printify' | 'merchize' | 'manual' | 'disabled' | string;
  productionCostCents?: unknown;
  shippingCostCents?: unknown;
  currency?: string | null;
  sourceReference?: string | null;
  sourceEventId?: string | null;
  costKnown?: boolean;
  metadata?: Prisma.InputJsonValue;
};

export type NormalizedProviderCosts = {
  provider: string;
  productionCostCents: MoneyCents;
  shippingCostCents: MoneyCents;
  currency: string;
  sourceReference: string | null;
  sourceEventId: string | null;
  costKnown: boolean;
  metadata?: Prisma.InputJsonValue;
};

export type OrderEconomicsInput = {
  orderId: string;
  grossRevenueCents: MoneyCents;
  subtotalCents: MoneyCents;
  discountAmountCents: MoneyCents;
  shippingCollectedCents: MoneyCents;
  taxCollectedCents: MoneyCents;
  stripeFeeCents: MoneyCents;
  providerProductionCostCents: MoneyCents;
  providerShippingCostCents: MoneyCents;
  refundAmountCents: MoneyCents;
  currency: string;
  jurisdiction?: CustomerJurisdiction | null;
  sourceProvider: string;
  sourceEventId: string;
  sourceReference?: string | null;
  occurredAt: Date;
  stripeFeeKnown?: boolean;
  providerCostsKnown?: boolean;
};

export type OrderEconomicsSnapshot = OrderEconomicsInput & {
  netRevenueCents: MoneyCents;
  grossMarginCents: MoneyCents;
  customerJurisdiction: string | null;
};

export const FINANCIAL_TRANSACTION_COMPATIBILITY_DECISION = {
  model: 'FinancialTransaction',
  decision: 'preserve_compatibility_bridge',
  reason:
    'TaxLedgerEntry is the append-oriented accounting source for commerce proof rows; FinancialTransaction remains for legacy admin summaries until those reads are migrated.',
} as const;

function asCents(value: unknown): MoneyCents {
  return typeof value === 'number' && Number.isInteger(value) ? value : 0;
}

function asPositiveCents(value: unknown): MoneyCents {
  return Math.max(0, asCents(value));
}

export function normalizeCurrency(currency?: string | null) {
  return (currency || 'usd').toUpperCase();
}

export function formatCustomerJurisdiction(jurisdiction?: CustomerJurisdiction | null) {
  if (!jurisdiction) return null;
  const parts = [jurisdiction.country, jurisdiction.state, jurisdiction.postalCode]
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter(Boolean);
  return parts.length > 0 ? parts.join('-') : null;
}

export function normalizeProviderCosts(input: ProviderCostInput): NormalizedProviderCosts {
  return {
    provider: input.provider,
    productionCostCents: asPositiveCents(input.productionCostCents),
    shippingCostCents: asPositiveCents(input.shippingCostCents),
    currency: normalizeCurrency(input.currency),
    sourceReference: input.sourceReference ?? null,
    sourceEventId: input.sourceEventId ?? null,
    costKnown: input.costKnown === true,
    metadata: input.metadata,
  };
}

export function extractPrintifyProviderCosts(input: {
  productionCostCents?: unknown;
  shippingCostCents?: unknown;
  currency?: string | null;
  sourceReference?: string | null;
  sourceEventId?: string | null;
}): NormalizedProviderCosts {
  return normalizeProviderCosts({
    provider: 'printify',
    productionCostCents: input.productionCostCents,
    shippingCostCents: input.shippingCostCents,
    currency: input.currency,
    sourceReference: input.sourceReference,
    sourceEventId: input.sourceEventId,
    costKnown:
      Number.isInteger(input.productionCostCents) || Number.isInteger(input.shippingCostCents),
  });
}

function firstInteger(...values: unknown[]) {
  for (const value of values) {
    if (Number.isInteger(value)) return value;
  }
  return undefined;
}

function sumIntegerField(items: unknown, key: string) {
  if (!Array.isArray(items)) return undefined;
  const values = items
    .map((item) => (item && typeof item === 'object' ? (item as Record<string, unknown>)[key] : undefined))
    .filter(Number.isInteger) as number[];
  if (values.length === 0) return undefined;
  return values.reduce((sum, value) => sum + value, 0);
}

export function extractPrintifyProviderCostsFromOrderResponse(response: unknown) {
  const record = response && typeof response === 'object' ? (response as Record<string, unknown>) : {};
  const costs = record.costs && typeof record.costs === 'object'
    ? (record.costs as Record<string, unknown>)
    : {};

  return extractPrintifyProviderCosts({
    productionCostCents: firstInteger(
      record.production_cost,
      record.total_production_cost,
      record.total_cost,
      costs.production,
      costs.production_cost,
      sumIntegerField(record.line_items, 'cost'),
      sumIntegerField(record.line_items, 'production_cost'),
    ),
    shippingCostCents: firstInteger(
      record.shipping_cost,
      record.total_shipping_cost,
      costs.shipping,
      costs.shipping_cost,
    ),
    currency:
      typeof record.currency === 'string'
        ? record.currency
        : typeof costs.currency === 'string'
          ? costs.currency
          : null,
    sourceReference:
      typeof record.id === 'string' || typeof record.id === 'number' ? String(record.id) : null,
  });
}

export function extractMerchizeProviderCosts(input: {
  itemCostCents?: unknown;
  shippingCostCents?: unknown;
  currency?: string | null;
  sourceReference?: string | null;
  sourceEventId?: string | null;
}): NormalizedProviderCosts {
  return normalizeProviderCosts({
    provider: 'merchize',
    productionCostCents: input.itemCostCents,
    shippingCostCents: input.shippingCostCents,
    currency: input.currency,
    sourceReference: input.sourceReference,
    sourceEventId: input.sourceEventId,
    costKnown: Number.isInteger(input.itemCostCents) || Number.isInteger(input.shippingCostCents),
  });
}

export function calculateOrderEconomics(input: OrderEconomicsInput): OrderEconomicsSnapshot {
  const grossRevenueCents = asPositiveCents(input.grossRevenueCents);
  const subtotalCents = asPositiveCents(input.subtotalCents);
  const discountAmountCents = asPositiveCents(input.discountAmountCents);
  const shippingCollectedCents = asPositiveCents(input.shippingCollectedCents);
  const taxCollectedCents = asPositiveCents(input.taxCollectedCents);
  const stripeFeeCents = asPositiveCents(input.stripeFeeCents);
  const providerProductionCostCents = asPositiveCents(input.providerProductionCostCents);
  const providerShippingCostCents = asPositiveCents(input.providerShippingCostCents);
  const refundAmountCents = asPositiveCents(input.refundAmountCents);
  const netRevenueCents =
    grossRevenueCents -
    stripeFeeCents -
    refundAmountCents -
    providerProductionCostCents -
    providerShippingCostCents;
  const grossMarginCents =
    grossRevenueCents -
    providerProductionCostCents -
    providerShippingCostCents -
    refundAmountCents;

  return {
    ...input,
    grossRevenueCents,
    subtotalCents,
    discountAmountCents,
    shippingCollectedCents,
    taxCollectedCents,
    stripeFeeCents,
    providerProductionCostCents,
    providerShippingCostCents,
    refundAmountCents,
    currency: normalizeCurrency(input.currency),
    netRevenueCents,
    grossMarginCents,
    customerJurisdiction: formatCustomerJurisdiction(input.jurisdiction),
  };
}

export function economicsMetadata(snapshot: OrderEconomicsSnapshot): Prisma.InputJsonValue {
  return {
    grossRevenueCents: snapshot.grossRevenueCents,
    subtotalCents: snapshot.subtotalCents,
    discountAmountCents: snapshot.discountAmountCents,
    shippingCollectedCents: snapshot.shippingCollectedCents,
    taxCollectedCents: snapshot.taxCollectedCents,
    stripeFeeCents: snapshot.stripeFeeCents,
    providerProductionCostCents: snapshot.providerProductionCostCents,
    providerShippingCostCents: snapshot.providerShippingCostCents,
    refundAmountCents: snapshot.refundAmountCents,
    netRevenueCents: snapshot.netRevenueCents,
    grossMarginCents: snapshot.grossMarginCents,
    currency: snapshot.currency,
    customerJurisdiction: snapshot.customerJurisdiction,
    sourceProvider: snapshot.sourceProvider,
    sourceEventId: snapshot.sourceEventId,
    sourceReferencePresent: Boolean(snapshot.sourceReference),
    stripeFeeKnown: snapshot.stripeFeeKnown === true,
    providerCostsKnown: snapshot.providerCostsKnown === true,
  };
}

export function ledgerAmountsFromEconomics(snapshot: OrderEconomicsSnapshot) {
  return [
    { entryType: TaxLedgerEntryType.SALE_GROSS, amountCents: snapshot.subtotalCents },
    { entryType: TaxLedgerEntryType.DISCOUNT, amountCents: -snapshot.discountAmountCents },
    { entryType: TaxLedgerEntryType.SHIPPING_CHARGED, amountCents: snapshot.shippingCollectedCents },
    { entryType: TaxLedgerEntryType.TAX_COLLECTED, amountCents: snapshot.taxCollectedCents },
    { entryType: TaxLedgerEntryType.STRIPE_FEE, amountCents: -snapshot.stripeFeeCents },
    { entryType: TaxLedgerEntryType.REFUND, amountCents: -snapshot.refundAmountCents },
    {
      entryType: TaxLedgerEntryType.PROVIDER_PRODUCTION_COST,
      amountCents: -snapshot.providerProductionCostCents,
    },
    {
      entryType: TaxLedgerEntryType.PROVIDER_SHIPPING_COST,
      amountCents: -snapshot.providerShippingCostCents,
    },
    { entryType: TaxLedgerEntryType.NET_REVENUE_ESTIMATE, amountCents: snapshot.netRevenueCents },
  ] as const;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

export function jurisdictionFromStripeSession(session: Stripe.Checkout.Session) {
  const sessionRecord = asRecord(session);
  const shippingDetails = asRecord(sessionRecord.shipping_details);
  const customerDetails = asRecord(session.customer_details);
  const address = asRecord(shippingDetails.address ?? customerDetails.address);
  return {
    country: typeof address.country === 'string' ? address.country : null,
    state: typeof address.state === 'string' ? address.state : null,
    postalCode: typeof address.postal_code === 'string' ? address.postal_code : null,
  };
}

export function amountFromStripeSession(
  session: Stripe.Checkout.Session,
  key: 'amount_discount' | 'amount_shipping' | 'amount_tax',
) {
  const value = asRecord(session.total_details)[key];
  return asPositiveCents(value);
}
