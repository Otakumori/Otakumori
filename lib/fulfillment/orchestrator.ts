import 'server-only';

import {
  FulfillmentAttemptStatus,
  FulfillmentProvider,
  OrderStatus,
  type Prisma,
} from '@prisma/client';
import type Stripe from 'stripe';
import { logger } from '@/app/lib/logger';
import { env } from '@/env';
import { db as prisma } from '@/lib/db';
import { createPrintifyOrder, loadPrintifyOrderItems } from '@/lib/fulfillment/printify';
import { recordProviderCostLedger } from '@/lib/accounting/ledger';

export type FulfillmentDispatchSource = {
  source: 'stripe_webhook' | 'admin' | 'manual';
  sourceEventId?: string | null;
  sourceReference?: string | null;
  stripeSession?: Stripe.Checkout.Session;
};

export type FulfillmentDispatchResult = {
  status: FulfillmentAttemptStatus;
  provider: FulfillmentProvider;
  duplicate: boolean;
  externalOrderId?: string | null;
  errorCode?: string | null;
};

type AdapterValidation = {
  ok: boolean;
  code?: string;
  message?: string;
};

type FulfillmentAdapter = {
  validateConfig(): AdapterValidation;
  buildRequest(orderId: string, source: FulfillmentDispatchSource): Promise<Prisma.InputJsonValue>;
  submitOrder(
    orderId: string,
    source: FulfillmentDispatchSource,
  ): Promise<{
    ok: boolean;
    externalOrderId?: string | null;
    status?: string | null;
    errorCode?: string | null;
    errorMessage?: string | null;
    responseSummary?: Prisma.InputJsonValue;
  }>;
  mapResult(
    result: Awaited<ReturnType<FulfillmentAdapter['submitOrder']>>,
  ): FulfillmentAttemptStatus;
};

function isTruthy(value?: string | null) {
  return ['1', 'true'].includes((value ?? '').trim().toLowerCase());
}

export function isFulfillmentDryRunEnabled() {
  return (
    isTruthy(env.FULFILLMENT_DRY_RUN) || isTruthy(env.STRIPE_WEBHOOK_FULFILLMENT_DRY_RUN)
  );
}

export function resolveFulfillmentProvider(): FulfillmentProvider {
  const configured = env.FULFILLMENT_PROVIDER;
  if (configured === 'printify') return FulfillmentProvider.printify;
  if (configured === 'merchize') return FulfillmentProvider.merchize;
  if (configured === 'disabled') return FulfillmentProvider.disabled;
  return FulfillmentProvider.manual;
}

export function buildFulfillmentIdempotencyKey(
  orderId: string,
  provider: FulfillmentProvider,
  source: FulfillmentDispatchSource,
) {
  return [
    orderId,
    provider,
    source.sourceEventId || 'no-event',
    source.sourceReference || 'no-reference',
  ].join(':');
}

function toPrismaJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? {})) as Prisma.InputJsonValue;
}

function publicPrintifyRequestSummary(orderId: string, lineItems: number) {
  return toPrismaJsonValue({
    provider: 'printify',
    orderId,
    lineItemCount: lineItems,
    writesProvider: true,
  });
}

const printifyAdapter: FulfillmentAdapter = {
  validateConfig() {
    if (!env.PRINTIFY_API_KEY || !env.PRINTIFY_SHOP_ID || !env.PRINTIFY_API_URL) {
      return {
        ok: false,
        code: 'PRINTIFY_CONFIG_MISSING',
        message: 'Printify fulfillment is configured but credentials or shop config are missing.',
      };
    }
    return { ok: true };
  },
  async buildRequest(orderId) {
    const { lineItems, missingMappings } = await loadPrintifyOrderItems(orderId);
    return toPrismaJsonValue({
      provider: 'printify',
      orderId,
      lineItemCount: lineItems.length,
      missingMappingCount: missingMappings.length,
      writesProvider: true,
    });
  },
  async submitOrder(orderId, source) {
    if (!source.stripeSession) {
      return {
        ok: false,
        status: 'manual_review',
        errorCode: 'MISSING_STRIPE_SESSION',
        errorMessage: 'Stripe session is required for Printify order mapping.',
      };
    }

    const { lineItems, missingMappings } = await loadPrintifyOrderItems(orderId);
    if (missingMappings.length > 0 || lineItems.length === 0) {
      return {
        ok: false,
        status: 'manual_review',
        errorCode: missingMappings.length > 0 ? 'MISSING_PROVIDER_MAPPING' : 'NO_PROVIDER_ITEMS',
        errorMessage:
          missingMappings.length > 0
            ? 'Order has items without Printify mappings.'
            : 'Order has no Printify-eligible items.',
        responseSummary: publicPrintifyRequestSummary(orderId, lineItems.length),
      };
    }

    const result = await createPrintifyOrder(orderId, source.stripeSession);
    if (result.ok && result.providerCosts?.costKnown) {
      await recordProviderCostLedger({
        orderId,
        providerCosts: {
          ...result.providerCosts,
          sourceEventId: source.sourceEventId,
          sourceReference: result.printifyOrderId ?? result.providerCosts.sourceReference,
        },
      });
    }
    return {
      ok: result.ok,
      externalOrderId: result.printifyOrderId,
      status: result.status,
      errorCode: result.ok ? null : 'PRINTIFY_SUBMIT_FAILED',
      errorMessage: result.error?.slice(0, 500) ?? null,
      responseSummary: toPrismaJsonValue({
        provider: 'printify',
        accepted: result.ok,
        externalOrderIdPresent: Boolean(result.printifyOrderId),
        status: result.status ?? null,
        providerCostsKnown: result.providerCosts?.costKnown === true,
      }),
    };
  },
  mapResult(result) {
    if (result.ok) return FulfillmentAttemptStatus.succeeded;
    if (result.status === 'manual_review') return FulfillmentAttemptStatus.manual_review;
    return FulfillmentAttemptStatus.failed;
  },
};

const manualAdapter: FulfillmentAdapter = {
  validateConfig: () => ({ ok: true }),
  async buildRequest(orderId) {
    return toPrismaJsonValue({ provider: 'manual', orderId, writesProvider: false });
  },
  async submitOrder() {
    return {
      ok: false,
      status: 'manual_review',
      errorCode: 'MANUAL_FULFILLMENT',
      errorMessage: 'Fulfillment provider is manual; order requires manual review.',
    };
  },
  mapResult: () => FulfillmentAttemptStatus.manual_review,
};

const disabledAdapter: FulfillmentAdapter = {
  validateConfig: () => ({ ok: true }),
  async buildRequest(orderId) {
    return toPrismaJsonValue({ provider: 'disabled', orderId, writesProvider: false });
  },
  async submitOrder() {
    return {
      ok: false,
      status: 'skipped',
      errorCode: 'FULFILLMENT_DISABLED',
      errorMessage: 'Fulfillment is disabled.',
    };
  },
  mapResult: () => FulfillmentAttemptStatus.skipped,
};

const merchizeAdapter: FulfillmentAdapter = {
  validateConfig: () => ({
    ok: false,
    code: 'MERCHIZE_ORDER_API_UNCONFIRMED',
    message: 'Merchize fulfillment remains manual until the live order API shape is confirmed.',
  }),
  async buildRequest(orderId) {
    return toPrismaJsonValue({ provider: 'merchize', orderId, writesProvider: false });
  },
  async submitOrder() {
    return {
      ok: false,
      status: 'manual_review',
      errorCode: 'MERCHIZE_ORDER_API_UNCONFIRMED',
      errorMessage: 'Merchize fulfillment remains manual until the live order API shape is confirmed.',
    };
  },
  mapResult: () => FulfillmentAttemptStatus.manual_review,
};

function getAdapter(provider: FulfillmentProvider) {
  switch (provider) {
    case FulfillmentProvider.printify:
      return printifyAdapter;
    case FulfillmentProvider.merchize:
      return merchizeAdapter;
    case FulfillmentProvider.disabled:
      return disabledAdapter;
    case FulfillmentProvider.manual:
    default:
      return manualAdapter;
  }
}

async function createOrUpdateAttempt({
  orderId,
  provider,
  status,
  idempotencyKey,
  source,
  requestSummary,
  responseSummary,
  externalOrderId,
  errorCode,
  errorMessage,
}: {
  orderId: string;
  provider: FulfillmentProvider;
  status: FulfillmentAttemptStatus;
  idempotencyKey: string;
  source: FulfillmentDispatchSource;
  requestSummary?: Prisma.InputJsonValue;
  responseSummary?: Prisma.InputJsonValue;
  externalOrderId?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
}) {
  return prisma.fulfillmentAttempt.upsert({
    where: { idempotencyKey },
    update: {
      status,
      externalOrderId: externalOrderId ?? undefined,
      requestSummary: requestSummary ?? undefined,
      responseSummary: responseSummary ?? undefined,
      errorCode: errorCode ?? undefined,
      errorMessage: errorMessage?.slice(0, 500) ?? undefined,
      completedAt:
        status === FulfillmentAttemptStatus.pending ? undefined : new Date(),
      attemptCount: { increment: 1 },
    },
    create: {
      orderId,
      provider,
      status,
      externalOrderId: externalOrderId ?? undefined,
      idempotencyKey,
      sourceEventId: source.sourceEventId ?? undefined,
      sourceReference: source.sourceReference ?? undefined,
      requestSummary: requestSummary ?? undefined,
      responseSummary: responseSummary ?? undefined,
      errorCode: errorCode ?? undefined,
      errorMessage: errorMessage?.slice(0, 500) ?? undefined,
      completedAt:
        status === FulfillmentAttemptStatus.pending ? undefined : new Date(),
    },
  });
}

function orderStatusForAttempt(status: FulfillmentAttemptStatus) {
  if (status === FulfillmentAttemptStatus.succeeded) return OrderStatus.in_production;
  if (status === FulfillmentAttemptStatus.failed) return OrderStatus.fulfillment_failed;
  if (status === FulfillmentAttemptStatus.manual_review) return OrderStatus.manual_review;
  return null;
}

export async function dispatchFulfillment(
  orderId: string,
  source: FulfillmentDispatchSource,
): Promise<FulfillmentDispatchResult> {
  const provider = resolveFulfillmentProvider();
  const idempotencyKey = buildFulfillmentIdempotencyKey(orderId, provider, source);
  const existing = await prisma.fulfillmentAttempt.findUnique({ where: { idempotencyKey } });
  if (
    existing &&
    existing.status !== FulfillmentAttemptStatus.pending &&
    existing.status !== FulfillmentAttemptStatus.failed
  ) {
    return {
      status: existing.status,
      provider: existing.provider,
      duplicate: true,
      externalOrderId: existing.externalOrderId,
      errorCode: existing.errorCode,
    };
  }

  const adapter = getAdapter(provider);
  const requestSummary = await adapter.buildRequest(orderId, source);

  if (isFulfillmentDryRunEnabled()) {
    await createOrUpdateAttempt({
      orderId,
      provider,
      status: FulfillmentAttemptStatus.dry_run,
      idempotencyKey,
      source,
      requestSummary,
      responseSummary: toPrismaJsonValue({
        dryRun: true,
        provider,
        writesProvider: false,
      }),
    });
    logger.info('Fulfillment dry-run recorded without provider write', undefined, {
      orderId,
      provider,
      source: source.source,
    });
    return { status: FulfillmentAttemptStatus.dry_run, provider, duplicate: false };
  }

  const config = adapter.validateConfig();
  if (!config.ok) {
    await createOrUpdateAttempt({
      orderId,
      provider,
      status: FulfillmentAttemptStatus.manual_review,
      idempotencyKey,
      source,
      requestSummary,
      errorCode: config.code,
      errorMessage: config.message,
    });
    await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.manual_review },
    }).catch(() => undefined);
    return {
      status: FulfillmentAttemptStatus.manual_review,
      provider,
      duplicate: false,
      errorCode: config.code,
    };
  }

  const submitted = await adapter.submitOrder(orderId, source);
  const status = adapter.mapResult(submitted);
  await createOrUpdateAttempt({
    orderId,
    provider,
    status,
    idempotencyKey,
    source,
    requestSummary,
    responseSummary: submitted.responseSummary,
    externalOrderId: submitted.externalOrderId,
    errorCode: submitted.errorCode,
    errorMessage: submitted.errorMessage,
  });

  const nextOrderStatus = orderStatusForAttempt(status);
  if (nextOrderStatus) {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: nextOrderStatus },
    }).catch(() => undefined);
  }

  return {
    status,
    provider,
    duplicate: false,
    externalOrderId: submitted.externalOrderId,
    errorCode: submitted.errorCode,
  };
}
