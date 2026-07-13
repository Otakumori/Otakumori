import { logger } from '@/app/lib/logger';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db as prisma } from '@/lib/db';
import { env } from '@/env';
import { createPrintifyOrder } from '@/lib/fulfillment/printify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
});

async function saveEventOnce(id: string, type: string, payload: any) {
  try {
    await prisma.webhookEvent.create({ data: { id, type, payload } });
    return true;
  } catch {
    return false;
  }
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

  const firstTime = await saveEventOnce(event.id, event.type, event.data?.object ?? {});
  if (!firstTime) return NextResponse.json({ ok: true, duplicate: true });

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items.data.price.product'],
      });

      const user = await resolveUser(fullSession);
      if (!user) return NextResponse.json({ ok: true, note: 'no-user' });

      const total = fullSession.amount_total ?? 0;
      const currency = fullSession.currency ?? 'usd';
      const paymentIntentId = typeof fullSession.payment_intent === 'string' ? fullSession.payment_intent : null;

      const updateData: any = {
        status: 'pending_fulfillment',
        totalAmount: total,
        currency: currency.toUpperCase(),
        paidAt: new Date(),
      };

      const createData: any = {
        id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        stripeId: fullSession.id,
        totalAmount: total,
        currency: currency.toUpperCase(),
        status: 'pending_fulfillment',
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

      return NextResponse.json({ ok: true });
    }

    default:
      return NextResponse.json({ ok: true, ignored: event.type });
  }
}
