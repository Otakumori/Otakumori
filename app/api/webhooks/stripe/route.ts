import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db as prisma } from '@/lib/db';
import { env } from '@/env';

export const runtime = 'nodejs'; // needed for crypto, raw body
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
    return false; // already processed
  }
}

// Helper: find user from session
async function resolveUser(session: Stripe.Checkout.Session) {
  // 1) Preferred: map via StripeCustomer (customer id)
  if (session.customer && typeof session.customer === 'string') {
    const sc = await prisma.stripeCustomer.findUnique({
      where: { customerId: session.customer },
      include: { user: true },
    });
    if (sc?.user) return sc.user;
  }
  // 2) Fallback: you should pass Clerk's userId into client_reference_id when creating the session
  if (session.client_reference_id) {
    return prisma.user.findFirst({ where: { clerkId: session.client_reference_id } });
  }
  return null;
}

// Read raw body for signature verification
async function readRawBody(req: Request) {
  return await req.text();
}

// Simulate Printify order creation
async function simulatePrintifyOrderCreate(order: any, session: Stripe.Checkout.Session) {
  // In a real implementation, this would call the Printify API
  // For now, we'll simulate the order creation and log it

  const printifyOrderData = {
    external_id: order.id,
    line_items:
      session.line_items?.data.map((item) => ({
        product_id: item.price?.product,
        variant_id: item.price?.id,
        quantity: item.quantity,
      })) ?? [],
    shipping_method: 1, // Standard shipping
    send_shipping_notification: true,
    address_to: {
      first_name: (session as any).shipping_details?.name?.split(' ')[0] ?? 'Customer',
      last_name: (session as any).shipping_details?.name?.split(' ').slice(1).join(' ') ?? '',
      email: session.customer_details?.email ?? '',
      phone: session.customer_details?.phone ?? '',
      country: (session as any).shipping_details?.address?.country ?? 'US',
      region: (session as any).shipping_details?.address?.state ?? '',
      city: (session as any).shipping_details?.address?.city ?? '',
      address1: (session as any).shipping_details?.address?.line1 ?? '',
      address2: (session as any).shipping_details?.address?.line2 ?? '',
      zip: (session as any).shipping_details?.address?.postal_code ?? '',
    },
  };

  // Log the simulated Printify order creation
  console.warn('Simulated Printify order creation:', {
    orderId: order.id,
    printifyData: printifyOrderData,
    timestamp: new Date().toISOString(),
  });

  // In production, this would be:
  // const response = await fetch('https://api.printify.com/v1/shops/{shop_id}/orders.json', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${env.PRINTIFY_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(printifyOrderData),
  // });

  return { success: true, simulated: true };
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
    console.error('Invalid Stripe signature', err);
    return new NextResponse('Invalid signature', { status: 400 });
  }

  // Idempotency guard
  const firstTime = await saveEventOnce(event.id, event.type, event.data?.object ?? {});
  if (!firstTime) return NextResponse.json({ ok: true, duplicate: true });

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      // Get line items (to know if it's a petal pack, etc.)
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items.data.price.product'],
      });

      const user = await resolveUser(fullSession);
      if (!user) return NextResponse.json({ ok: true, note: 'no-user' });

      // Compute order totals
      const total = fullSession.amount_total ?? 0;
      const currency = fullSession.currency ?? 'usd';
      const paymentIntentId =
        typeof fullSession.payment_intent === 'string' ? fullSession.payment_intent : null;

      // Create or update Order using existing model
      const updateData: any = {
        status: 'shipped',
        totalAmount: total,
        currency: currency.toUpperCase(),
        paidAt: new Date(),
        appliedCouponCodes:
          (fullSession.metadata?.coupon_codes?.split(',').filter(Boolean) as
            | string[]
            | undefined) ?? [],
      };
      if (paymentIntentId) updateData.paymentIntentId = paymentIntentId;

      const createData: any = {
        id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        stripeId: fullSession.id,
        totalAmount: total,
        currency: currency.toUpperCase(),
        status: 'shipped',
        paidAt: new Date(),
        updatedAt: new Date(),
        appliedCouponCodes:
          (fullSession.metadata?.coupon_codes?.split(',').filter(Boolean) as
            | string[]
            | undefined) ?? [],
      };
      if (paymentIntentId) createData.paymentIntentId = paymentIntentId;

      const order = await prisma.order.upsert({
        where: { stripeId: fullSession.id },
        update: updateData,
        create: createData,
      });

      // Mark coupon redemptions as succeeded
      try {
        const codes = (fullSession.metadata?.coupon_codes || '').split(',').filter(Boolean);
        if (codes.length > 0) {
          const coupons = await prisma.coupon.findMany({
            where: { code: { in: codes } },
            select: { id: true, code: true },
          });
          for (const c of coupons) {
            await prisma.couponRedemption.updateMany({
              where: { couponId: c.id, status: 'PENDING' },
              data: { status: 'SUCCEEDED', orderId: order.id },
            });
          }
        }
      } catch (e) {
        console.warn('Coupon redemption update failed', e);
      }

      // Simulate Printify order creation
      try {
        await simulatePrintifyOrderCreate(order, fullSession);
      } catch (printifyError) {
        console.error('Printify order creation failed:', printifyError);
        // Don't fail the webhook - log and continue
      }

      // Detect petal packs by price/product metadata
      // Set metadata on Stripe dashboard (e.g., price.metadata.petal_amount = "1000")
      let petalToCredit = 0;
      fullSession.line_items?.data.forEach((item) => {
        const price = item.price;
        const meta =
          price?.metadata ?? (price?.product && (price.product as Stripe.Product).metadata) ?? {};
        const str = (meta as any)['petal_amount'];
        if (str) petalToCredit += parseInt(str, 10) * (item.quantity ?? 1);
      });

      if (petalToCredit > 0) {
        // Credit petals to user's wallet
        await prisma.wallet.upsert({
          where: { userId: user.id },
          update: { petals: { increment: petalToCredit } },
          create: { userId: user.id, petals: petalToCredit, runes: 0 },
        });

        // Create ledger entry
        await prisma.petalLedger.create({
          data: {
            userId: user.id,
            type: 'earn',
            amount: petalToCredit,
            reason: 'PETAL_PACK_CREDIT',
          },
        });
      }

      return NextResponse.json({ ok: true });
    }

    case 'charge.refunded':
    case 'charge.dispute.funds_withdrawn': {
      // Handle refunds / disputes â†’ negative ledger + status update
      const obj: any = event.data.object;
      const paymentIntentId = obj.payment_intent ?? obj.id ?? null;
      if (!paymentIntentId) return NextResponse.json({ ok: true });

      const order = await prisma.order.findFirst({
        where: { paymentIntentId: paymentIntentId },
        include: { User: true },
      });
      if (!order?.User) return NextResponse.json({ ok: true });

      // Update order status to cancelled for refunds
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'cancelled' },
      });

      return NextResponse.json({ ok: true });
    }

    case 'customer.created': {
      const customer = event.data.object as Stripe.Customer;
      const clerkId = (customer.metadata?.clerkId as string | undefined) ?? undefined;
      if (!clerkId) return NextResponse.json({ ok: true });

      const user = await prisma.user.findFirst({ where: { clerkId } });
      if (!user) return NextResponse.json({ ok: true });

      // upsert link
      await prisma.stripeCustomer.upsert({
        where: { userId: user.id },
        update: { customerId: customer.id },
        create: { userId: user.id, customerId: customer.id },
      });
      return NextResponse.json({ ok: true });
    }

    default:
      return NextResponse.json({ ok: true, ignored: event.type });
  }
}
