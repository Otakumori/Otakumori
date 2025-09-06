// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
export const runtime = 'nodejs';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { env } from '@/env';
import { prisma } from '@/app/lib/prisma';
import { CheckoutRequest } from '@/app/lib/contracts';
import { rateLimitConfigs, withRateLimit } from '@/app/lib/rateLimit';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

async function ensureIdempotency(key: string, purpose: string) {
  try {
    await prisma.idempotencyKey.create({ data: { key, purpose } });
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  return withRateLimit(req, rateLimitConfigs.api, async () => {
    const idemp = req.headers.get('x-idempotency-key') ?? '';
    if (!idemp)
      return NextResponse.json({ ok: false, error: 'Missing idempotency key' }, { status: 400 });

    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    if (!(await ensureIdempotency(idemp, 'checkout.session'))) {
      return NextResponse.json({ ok: true, data: { duplicate: true } });
    }

    const json = await req.json();
    const parsed = CheckoutRequest.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
    }

    const { items, successUrl, cancelUrl, shippingInfo } = parsed.data;

    // Get profile
    const user = await prisma.user.findFirst({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });

    const subtotalCents = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);

    // Create order skeleton
    const order = await prisma.order.create({
      data: {
        id: `order_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        userId: user.id,
        stripeId: `temp_${Date.now()}`,
        totalAmount: subtotalCents,
        subtotalCents,
        currency: 'USD',
        status: 'pending',
        primaryItemName: items[0]?.name ?? 'Order',
        label: `Order for ${shippingInfo?.firstName ?? user.display_name ?? user.username}`,
        updatedAt: new Date(),
      },
    });

    for (const item of items) {
      await prisma.orderItem.create({
        data: {
          id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          orderId: order.id,
          productId: item.productId,
          productVariantId: item.variantId,
          sku: item.sku ?? `SKU-${item.productId}`,
          name: item.name,
          quantity: item.quantity,
          unitAmount: item.priceCents,
          printifyProductId: item.printifyProductId,
          printifyVariantId: item.printifyVariantId,
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((i) => ({
        price_data: {
          currency: 'usd',
          product_data: { name: i.name, description: i.description, images: i.images },
          unit_amount: i.priceCents,
        },
        quantity: i.quantity,
      })),
      mode: 'payment',
      success_url:
        successUrl ??
        `${env.NEXT_PUBLIC_SITE_URL}/shop/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl ?? `${env.NEXT_PUBLIC_SITE_URL}/shop/cart`,
      client_reference_id: userId,
      customer_email: shippingInfo?.email ?? user.email,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP'],
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeId: session.id, updatedAt: new Date() },
    });

    return NextResponse.json({
      ok: true,
      data: { url: session.url, orderId: order.id, orderNumber: order.displayNumber },
    });
  });
}
