import { logger } from '@/app/lib/logger';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import type { Prisma } from '@prisma/client';
import { db as prisma } from '@/lib/db';
import { env } from '@/env';
import { createPrintifyOrder } from '@/lib/fulfillment/printify';
import { capturePaidOrderLedger, reconcileRefundLedger } from '@/lib/finance/ledger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
});

type EventProcessingStatus = 'processing' | 'completed' | 'failed';

function eventPayload(
  status: EventProcessingStatus,
  object: unknown,
  details: Record<string, Prisma.InputJsonValue> = {},
): Prisma.InputJsonObject {
  return { processingStatus: status, object: object as Prisma.InputJsonValue, ...details };
}

async function claimEvent(event: Stripe.Event) {
  try {
    await prisma.webhookEvent.create({
      data: {
        id: event.id,
        type: event.type,
        payload: eventPayload('processing', event.data?.object ?? {}),
      },
    });
    return 'claimed' as const;
  } catch (error) {
    const existing = await prisma.webhookEvent.findUnique({ where: { id: event.id } });
    if (!existing) throw error;
    const payload = existing.payload as { processingStatus?: EventProcessingStatus } | null;
    if (payload?.processingStatus === 'completed') return 'completed' as const;
    if (
      payload?.processingStatus === 'processing' &&
      Date.now() - existing.updatedAt.getTime() < 5 * 60 * 1000
    ) {
      return 'processing' as const;
    }
    await prisma.webhookEvent.update({
      where: { id: event.id },
      data: { payload: eventPayload('processing', event.data?.object ?? {}, { retry: true }) },
    });
    return 'claimed' as const;
  }
}

async function finishEvent(
  event: Stripe.Event,
  status: Exclude<EventProcessingStatus, 'processing'>,
  details: Record<string, Prisma.InputJsonValue> = {},
) {
  await prisma.webhookEvent.update({
    where: { id: event.id },
    data: { payload: eventPayload(status, event.data?.object ?? {}, details) },
  });
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
    logger.error(
      'Invalid Stripe signature',
      undefined,
      undefined,
      err instanceof Error ? err : new Error(String(err)),
    );
    return new NextResponse('Invalid signature', { status: 400 });
  }

  try {
    const claim = await claimEvent(event);
    if (claim === 'completed') return NextResponse.json({ ok: true, duplicate: true });
    if (claim === 'processing') {
      return NextResponse.json(
        { ok: false, retry: true, error: 'Webhook event is already processing.' },
        { status: 409 },
      );
    }

    const outcome: Record<string, Prisma.InputJsonValue> = {};
    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: [
          'line_items.data.price.product',
          'payment_intent.latest_charge.balance_transaction',
        ],
      });

      if (fullSession.payment_status !== 'paid') {
        outcome.paymentPending = true;
      } else {
        const order = await prisma.order.findUnique({
          where: { stripeId: fullSession.id },
          include: { User: { select: { clerkId: true } } },
        });
        if (!order) {
          throw new Error(`No pre-created order exists for Stripe session ${fullSession.id}`);
        }
        if (
          fullSession.client_reference_id &&
          order.User.clerkId !== fullSession.client_reference_id
        ) {
          throw new Error(`Stripe session ownership mismatch for order ${order.id}`);
        }

        const paymentIntent = fullSession.payment_intent;
        const paymentIntentId =
          typeof paymentIntent === 'string' ? paymentIntent : (paymentIntent?.id ?? null);
        const latestCharge =
          paymentIntent && typeof paymentIntent !== 'string' ? paymentIntent.latest_charge : null;
        const chargeId =
          typeof latestCharge === 'string' ? latestCharge : (latestCharge?.id ?? null);
        const balanceTransaction =
          latestCharge && typeof latestCharge !== 'string'
            ? latestCharge.balance_transaction
            : null;
        const stripeFee =
          balanceTransaction && typeof balanceTransaction !== 'string'
            ? {
                amount: balanceTransaction.fee,
                balanceTransactionId: balanceTransaction.id,
              }
            : null;
        const totalDetails = fullSession.total_details;

        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'pending_mapping',
            totalAmount: fullSession.amount_total ?? order.totalAmount,
            subtotalCents: fullSession.amount_subtotal ?? order.subtotalCents,
            currency: (fullSession.currency ?? order.currency).toUpperCase(),
            taxAmount: totalDetails?.amount_tax ?? order.taxAmount,
            shippingAmount: totalDetails?.amount_shipping ?? order.shippingAmount,
            discountAmount: Math.max(order.discountAmount ?? 0, totalDetails?.amount_discount ?? 0),
            paymentIntentId: paymentIntentId ?? order.paymentIntentId,
            chargeId: chargeId ?? order.chargeId,
            paidAt: order.paidAt ?? new Date(),
            notes: null,
          },
        });

        const shippingAddress = (fullSession as any).shipping_details?.address;
        const ledgerResult = await capturePaidOrderLedger({
          orderId: order.id,
          stripeSessionId: fullSession.id,
          chargeId,
          paymentIntentId,
          jurisdiction: {
            country: shippingAddress?.country ?? null,
            state: shippingAddress?.state ?? null,
          },
          stripeFee,
        });
        outcome.financialLedger = 'captured';
        outcome.cogsStatus = ledgerResult.cogsStatus;

        const result = await createPrintifyOrder(order.id, fullSession);
        if (!result.ok) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'pending_mapping',
              notes:
                `Fulfillment requires operator review: ${result.error ?? 'unknown error'}`.slice(
                  0,
                  1000,
                ),
            },
          });
          outcome.fulfillment = 'operator_review';
        } else {
          outcome.fulfillment = 'accepted';
          if (result.printifyOrderId) outcome.printifyOrderId = result.printifyOrderId;
        }
      }
    } else if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId =
        typeof charge.payment_intent === 'string'
          ? charge.payment_intent
          : charge.payment_intent?.id;
      if (!paymentIntentId) throw new Error(`Refunded charge ${charge.id} has no PaymentIntent`);

      const order = await prisma.order.findFirst({ where: { paymentIntentId } });
      if (!order) throw new Error(`No local order exists for refunded charge ${charge.id}`);

      const fullyRefunded = charge.amount_refunded >= order.totalAmount;
      await prisma.order.update({
        where: { id: order.id },
        data: {
          chargeId: charge.id,
          refundAmount: charge.amount_refunded,
          refundedAt: new Date(),
          status: fullyRefunded ? 'cancelled' : order.status,
          notes: fullyRefunded
            ? 'Payment fully refunded in Stripe.'
            : 'Payment partially refunded in Stripe.',
        },
      });
      await reconcileRefundLedger({
        orderId: order.id,
        chargeId: charge.id,
        amountRefunded: charge.amount_refunded,
        currency: charge.currency,
        occurredAt: new Date(event.created * 1000),
      });
      outcome.refundRecorded = true;
    } else {
      outcome.ignored = event.type;
    }

    await finishEvent(event, 'completed', outcome);
    return NextResponse.json({ ok: true, ...outcome });
  } catch (error) {
    logger.error(
      'Stripe webhook processing failed',
      undefined,
      { eventId: event.id, eventType: event.type },
      error instanceof Error ? error : new Error(String(error)),
    );
    await finishEvent(event, 'failed', {
      error: error instanceof Error ? error.message.slice(0, 500) : 'unknown',
    }).catch(() => undefined);
    return NextResponse.json({ ok: false, retry: true }, { status: 500 });
  }
}
