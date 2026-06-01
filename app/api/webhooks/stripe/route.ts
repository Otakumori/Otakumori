import { logger } from '@/app/lib/logger';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { OrderStatus, type Prisma } from '@prisma/client';
import { db as prisma } from '@/lib/db';
import { env } from '@/env';
import {
  recordStripePaidOrderLedger,
  recordStripeRefundLedger,
  resolveStripePaymentAccounting,
} from '@/lib/accounting/ledger';
import { dispatchFulfillment } from '@/lib/fulfillment/orchestrator';
import { guardStripeRuntimeUsage } from '@/lib/security/stripe-runtime-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getStripeClient() {
  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-10-29.clover',
    typescript: true,
  });
}

const STRIPE_PROVIDER = 'stripe';

type BeginWebhookProcessingResult = {
  shouldProcess: boolean;
  reason?: 'already_processed' | 'in_flight' | 'concurrent_duplicate';
};

function toPrismaJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? {})) as Prisma.InputJsonValue;
}

function createOrderId() {
  return `order_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

async function beginWebhookProcessing(event: Stripe.Event): Promise<BeginWebhookProcessingResult> {
  const existing = await prisma.webhookEvent.findUnique({
    where: {
      provider_externalEventId: {
        provider: STRIPE_PROVIDER,
        externalEventId: event.id,
      },
    },
    select: {
      id: true,
      processingStatus: true,
    },
  });

  if (existing?.processingStatus === 'processed') {
    return { shouldProcess: false, reason: 'already_processed' };
  }

  if (existing?.processingStatus === 'processing') {
    return { shouldProcess: false, reason: 'in_flight' };
  }

  const processingUpdate = {
    type: event.type,
    payload: toPrismaJsonValue(event.data?.object ?? {}),
    processingStatus: 'processing',
    processedAt: null,
    lastError: null,
  } as const;

  if (existing) {
    await prisma.webhookEvent.update({
      where: { id: existing.id },
      data: {
        ...processingUpdate,
        attemptCount: { increment: 1 },
      },
    });
    return { shouldProcess: true };
  }

  try {
    await prisma.webhookEvent.create({
      data: {
        provider: STRIPE_PROVIDER,
        externalEventId: event.id,
        ...processingUpdate,
        attemptCount: 1,
      },
    });
    return { shouldProcess: true };
  } catch (error) {
    const raceRow = await prisma.webhookEvent.findUnique({
      where: {
        provider_externalEventId: {
          provider: STRIPE_PROVIDER,
          externalEventId: event.id,
        },
      },
      select: {
        id: true,
        processingStatus: true,
      },
    });

    if (!raceRow) throw error;

    if (raceRow.processingStatus === 'processed' || raceRow.processingStatus === 'processing') {
      return { shouldProcess: false, reason: 'concurrent_duplicate' };
    }

    await prisma.webhookEvent.update({
      where: { id: raceRow.id },
      data: {
        ...processingUpdate,
        attemptCount: { increment: 1 },
      },
    });
    return { shouldProcess: true };
  }
}

async function markWebhookProcessed(externalEventId: string) {
  await prisma.webhookEvent.update({
    where: {
      provider_externalEventId: {
        provider: STRIPE_PROVIDER,
        externalEventId,
      },
    },
    data: {
      processingStatus: 'processed',
      processedAt: new Date(),
      lastError: null,
    },
  });
}

async function markWebhookFailed(externalEventId: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  await prisma.webhookEvent.update({
    where: {
      provider_externalEventId: {
        provider: STRIPE_PROVIDER,
        externalEventId,
      },
    },
    data: {
      processingStatus: 'failed',
      lastError: message,
    },
  });
}

async function resolveUser(session: Stripe.Checkout.Session) {
  if (session.customer && typeof session.customer === 'string') {
    const sc = await prisma.stripeCustomer.findUnique({
      where: { customerId: session.customer },
      include: { User: true },
    });
    if (sc?.User) return sc.User;
  }

  if (session.client_reference_id) {
    return prisma.user.findFirst({ where: { clerkId: session.client_reference_id } });
  }

  return null;
}

async function readRawBody(req: Request) {
  return await req.text();
}

export async function POST(req: Request) {
  const stripeGuard = guardStripeRuntimeUsage({
    secretKey: env.STRIPE_SECRET_KEY,
    vercelEnv: env.VERCEL_ENV,
    nodeEnv: env.NODE_ENV,
    allowLiveInNonProd: env.ALLOW_LIVE_KEYS_IN_NON_PROD === 'true',
    allowTestInProd: env.ALLOW_TEST_KEYS_IN_PRODUCTION === 'true',
  });
  if (!stripeGuard.ok) {
    logger.error('Stripe webhook runtime guard blocked request', undefined, {
      reason: stripeGuard.reason,
      target: stripeGuard.target,
      mode: stripeGuard.mode,
    });
    return new NextResponse('Stripe runtime guard blocked request', { status: 503 });
  }

  const stripe = getStripeClient();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature');
  if (!sig) return new NextResponse('Missing Stripe-Signature', { status: 400 });

  const secret = env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return new NextResponse('Missing STRIPE_WEBHOOK_SECRET', { status: 500 });

  const raw = await readRawBody(req);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    logger.error(
      'Invalid Stripe signature',
      undefined,
      undefined,
      err instanceof Error ? err : new Error(String(err)),
    );
    return new NextResponse('Invalid signature', { status: 400 });
  }

  const lock = await beginWebhookProcessing(event);
  if (!lock.shouldProcess) {
    return NextResponse.json({ ok: true, duplicate: true, reason: lock.reason });
  }

  try {
    let responsePayload: Record<string, unknown> = { ok: true, ignored: event.type };

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['line_items.data.price.product'],
        });

        const total = fullSession.amount_total ?? 0;
        const currency = fullSession.currency ?? 'usd';
        const paymentIntentId =
          typeof fullSession.payment_intent === 'string' ? fullSession.payment_intent : null;
        const accounting = await resolveStripePaymentAccounting(stripe, fullSession);
        const localOrderId =
          typeof fullSession.metadata?.local_order_id === 'string'
            ? fullSession.metadata.local_order_id
            : null;
        const user = await resolveUser(fullSession);

        const updateData: {
          status: OrderStatus;
          totalAmount: number;
          currency: string;
          paidAt: Date;
          paymentIntentId?: string;
          chargeId?: string;
        } = {
          status: OrderStatus.pending_fulfillment,
          totalAmount: total,
          currency: currency.toUpperCase(),
          paidAt: new Date(),
        };

        const createData: {
          stripeId: string;
          totalAmount: number;
          currency: string;
          status: OrderStatus;
          paidAt: Date;
          updatedAt: Date;
          paymentIntentId?: string;
          chargeId?: string;
        } = {
          stripeId: fullSession.id,
          totalAmount: total,
          currency: currency.toUpperCase(),
          status: OrderStatus.pending_fulfillment,
          paidAt: new Date(),
          updatedAt: new Date(),
        };

        if (paymentIntentId) {
          updateData.paymentIntentId = paymentIntentId;
          createData.paymentIntentId = paymentIntentId;
        }

        if (accounting.chargeId) {
          updateData.chargeId = accounting.chargeId;
          createData.chargeId = accounting.chargeId;
        }

        let order;
        if (localOrderId) {
          order = await prisma.order
            .update({
              where: { id: localOrderId },
              data: {
                ...updateData,
                stripeId: fullSession.id,
              },
            })
            .catch(async () => {
              if (!user) return null;

              return prisma.order.upsert({
                where: { stripeId: fullSession.id },
                update: updateData,
                create: {
                  ...createData,
                  id: createOrderId(),
                  userId: user.id,
                },
              });
            });
        } else if (user) {
          order = await prisma.order.upsert({
            where: { stripeId: fullSession.id },
            update: updateData,
            create: {
              ...createData,
              id: createOrderId(),
              userId: user.id,
            },
          });
        } else {
          order = null;
        }

        if (!order) {
          responsePayload = { ok: true, note: 'no-local-order' };
          break;
        }

        await recordStripePaidOrderLedger({
          orderId: order.id,
          session: fullSession,
          sourceEventId: event.id,
          stripeFeeCents: accounting.stripeFeeCents,
          stripeFeeKnown: accounting.stripeFeeKnown,
          chargeId: accounting.chargeId,
        });

        const fulfillment = await dispatchFulfillment(order.id, {
          source: 'stripe_webhook',
          sourceEventId: event.id,
          sourceReference: fullSession.id,
          stripeSession: fullSession,
        });

        responsePayload = {
          ok: true,
          fulfillment: fulfillment.status,
          fulfillmentProvider: fulfillment.provider,
          duplicateFulfillment: fulfillment.duplicate,
        };
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId =
          typeof charge.payment_intent === 'string' ? charge.payment_intent : null;
        const order = await prisma.order.findFirst({
          where: {
            OR: [
              { chargeId: charge.id },
              ...(paymentIntentId ? [{ paymentIntentId }] : []),
            ],
          },
        });

        if (!order) {
          responsePayload = { ok: true, note: 'refund-no-local-order' };
          break;
        }

        const amountRefunded = charge.amount_refunded ?? 0;
        await prisma.order.update({
          where: { id: order.id },
          data: {
            refundAmount: amountRefunded,
            refundedAt: amountRefunded > 0 ? new Date() : undefined,
          },
        });
        await recordStripeRefundLedger({
          orderId: order.id,
          currency: charge.currency ?? order.currency,
          amountRefunded,
          sourceEventId: event.id,
          sourceReference: charge.id,
        });

        responsePayload = { ok: true, refundLedger: 'recorded' };
        break;
      }

      default:
        responsePayload = { ok: true, ignored: event.type };
        break;
    }

    await markWebhookProcessed(event.id);
    return NextResponse.json(responsePayload);
  } catch (error) {
    await markWebhookFailed(event.id, error);
    logger.error(
      'Stripe webhook processing failed',
      undefined,
      { eventId: event.id, eventType: event.type },
      error instanceof Error ? error : new Error(String(error)),
    );
    return new NextResponse('Webhook processing failed', { status: 500 });
  }
}
