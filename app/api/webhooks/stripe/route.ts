import { logger } from '@/app/lib/logger';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { OrderStatus, type Prisma } from '@prisma/client';
import { db as prisma } from '@/lib/db';
import { env } from '@/env';
import { createPrintifyOrder } from '@/lib/fulfillment/printify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
});

const STRIPE_PROVIDER = 'stripe';

type BeginWebhookProcessingResult = {
  shouldProcess: boolean;
  reason?: 'already_processed' | 'in_flight' | 'concurrent_duplicate';
};

function toPrismaJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? {})) as Prisma.InputJsonValue;
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
    logger.error('Invalid Stripe signature', undefined, undefined, err instanceof Error ? err : new Error(String(err)));
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

        const user = await resolveUser(fullSession);
        if (!user) {
          responsePayload = { ok: true, note: 'no-user' };
          break;
        }

        const total = fullSession.amount_total ?? 0;
        const currency = fullSession.currency ?? 'usd';
        const paymentIntentId = typeof fullSession.payment_intent === 'string' ? fullSession.payment_intent : null;

        const updateData: {
          status: OrderStatus;
          totalAmount: number;
          currency: string;
          paidAt: Date;
          paymentIntentId?: string;
        } = {
          status: OrderStatus.pending_fulfillment,
          totalAmount: total,
          currency: currency.toUpperCase(),
          paidAt: new Date(),
        };

        const createData: {
          id: string;
          userId: string;
          stripeId: string;
          totalAmount: number;
          currency: string;
          status: OrderStatus;
          paidAt: Date;
          updatedAt: Date;
          paymentIntentId?: string;
        } = {
          id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
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

        const order = await prisma.order.upsert({
          where: { stripeId: fullSession.id },
          update: updateData,
          create: createData,
        });

        try {
          const result = await createPrintifyOrder(order.id, fullSession);

          if (!result.ok) {
            logger.error('Printify fulfillment failed', undefined, undefined, new Error(result.error || 'unknown'));
          } else {
            logger.info('Printify fulfillment success', undefined, {
              orderId: order.id,
              printifyOrderId: result.printifyOrderId,
            });
          }
        } catch (err) {
          logger.error('Printify fulfillment exception', undefined, undefined, err instanceof Error ? err : new Error(String(err)));
        }

        responsePayload = { ok: true };
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
    logger.error('Stripe webhook processing failed', undefined, { eventId: event.id, eventType: event.type }, error instanceof Error ? error : new Error(String(error)));
    return new NextResponse('Webhook processing failed', { status: 500 });
  }
}
