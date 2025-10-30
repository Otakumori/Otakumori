// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
export const runtime = 'nodejs';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { env } from '@/env';
import { getRuntimeOrigin } from '@/lib/runtimeOrigin';
import { prisma } from '@/app/lib/prisma';
import { CheckoutRequest } from '@/app/lib/contracts';
import { getApplicableCoupons, normalizeCode, type CouponMeta } from '@/lib/coupons/engine';
import { rateLimitConfigs, withRateLimit } from '@/app/lib/rateLimit';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, { 
  apiVersion: '2025-10-29.clover',
  typescript: true 
});

// NOTE: This route should use the proper idempotency middleware instead of manual key creation

export async function POST(req: NextRequest) {
  return withRateLimit(req, rateLimitConfigs.api, async () => {
    const idemp = req.headers.get('x-idempotency-key') ?? '';
    if (!idemp)
      return NextResponse.json({ ok: false, error: 'Missing idempotency key' }, { status: 400 });

    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    // TODO: Implement proper idempotency check using the middleware

    const json = await req.json();
    const parsed = CheckoutRequest.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
    }

    const { items, successUrl, cancelUrl, shippingInfo, couponCodes, shipping } =
      parsed.data as any;

    // Get profile
    const user = await prisma.user.findFirst({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });

    const subtotalCents = items.reduce((sum: number, i: any) => sum + i.priceCents * i.quantity, 0);

    // Coupons: fetch metadata and compute breakdown
    let appliedCodes: string[] = [];
    let discountTotalCents = 0;
    let shippingDiscountCents = 0;
    let discountedLineItems: { id: string; totalDiscountCents: number }[] = [];
    if (Array.isArray(couponCodes) && couponCodes.length > 0) {
      const codes = (couponCodes as string[]).map(normalizeCode);
      const rows = await prisma.coupon.findMany({ where: { code: { in: codes } } });
      const metas: CouponMeta[] = rows.map((r: any) => ({
        id: r.id,
        code: r.code,
        type: r.type as any,
        value: r.value,
        valueCents: r.value,
        valuePct: r.type === 'PERCENT' ? r.value : undefined,
        enabled: r.enabled,
        startsAt: r.startsAt,
        endsAt: r.endsAt ?? undefined,
        maxRedemptions: r.maxRedemptions ?? undefined,
        maxRedemptionsPerUser: r.maxRedemptionsPerUser ?? undefined,
        minSubtotalCents: r.minSubtotal ?? undefined,
        allowedProductIds: r.allowedProductIds,
        excludedProductIds: r.excludedProductIds,
        allowedCollections: r.allowedCollections,
        excludedCollections: r.excludedCollections,
        stackable: r.stackable,
        oneTimeCode: r.oneTimeCode,
      }));

      const breakdown = await getApplicableCoupons({
        now: new Date(),
        items: items.map((i: any) => ({
          id: i.productId ?? i.sku ?? i.variantId ?? i.name,
          productId: i.productId,
          collectionIds: [],
          quantity: i.quantity,
          unitPrice: i.priceCents / 100,
        })),
        shipping: shipping
          ? { provider: shipping.provider ?? 'stripe', fee: shipping.fee ?? 0 }
          : { provider: 'stripe', fee: 0 },
        coupons: metas,
        codesOrder: codes,
      });
      appliedCodes = breakdown.normalizedCodes;
      discountTotalCents = Math.round(breakdown.discountTotal * 100);
      shippingDiscountCents = Math.round(breakdown.shippingDiscount * 100);

      // Allocate non-shipping discount proportionally to eligible items for each coupon
      const itemTotals = items.map((i: any) => ({
        key: i.productId ?? i.sku ?? i.variantId ?? i.name,
        quantity: i.quantity,
        unit: i.priceCents,
        total: i.priceCents * i.quantity,
        productId: i.productId,
      }));
      const discountsPerItem: Record<string, number> = {};
      const nonShipDiscountCents = discountTotalCents - shippingDiscountCents;
      if (nonShipDiscountCents > 0) {
        // Proportional to item total
        const total = itemTotals.reduce((s: number, it: any) => s + it.total, 0);
        let acc = 0;
        itemTotals.forEach((it: any, idx: number) => {
          let d = Math.floor((nonShipDiscountCents * it.total) / total);
          // last item gets remainder
          if (idx === itemTotals.length - 1) d = nonShipDiscountCents - acc;
          discountsPerItem[it.key] = d;
          acc += d;
        });
      }
      discountedLineItems = itemTotals.map((it: any) => ({
        id: it.key,
        totalDiscountCents: discountsPerItem[it.key] ?? 0,
      }));
    }

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
        appliedCouponCodes: appliedCodes,
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

    // Build line items with discounted unit_amount
    const lineItems = items.map((i: any) => {
      const key = i.productId ?? i.sku ?? i.variantId ?? i.name;
      const totalDiscount = discountedLineItems.find((d) => d.id === key)?.totalDiscountCents ?? 0;
      const qty = i.quantity;
      const perItemBase = i.priceCents;
      let perItemDiscount = Math.floor(totalDiscount / qty);
      let unitAmount = Math.max(0, perItemBase - perItemDiscount);
      return {
        price_data: {
          currency: 'usd',
          product_data: { name: i.name, description: i.description, images: i.images },
          unit_amount: unitAmount,
        },
        quantity: qty,
      } as any;
    });

    // Adjust for penny drift: ensure totals align
    const original = subtotalCents;
    const discountedSum = lineItems.reduce(
      (s: number, li: any) => s + (li.price_data.unit_amount as number) * (li.quantity as number),
      0,
    );
    const nonShipDiscountCents = discountTotalCents - shippingDiscountCents;
    const target = original - Math.max(0, nonShipDiscountCents);
    let delta = discountedSum - target; // positive means we need to subtract more from first item
    if (delta !== 0 && lineItems.length > 0) {
      for (let i = 0; i < lineItems.length && delta !== 0; i++) {
        const li: any = lineItems[i];
        const canReduce = Math.min(delta, li.price_data.unit_amount - 0); // don't go negative
        if (canReduce > 0) {
          li.price_data.unit_amount -= canReduce;
          delta -= canReduce;
        }
      }
    }

    const shippingOptions =
      shippingDiscountCents > 0
        ? [
            {
              shipping_rate_data: {
                type: 'fixed_amount',
                fixed_amount: { amount: 0, currency: 'usd' },
                display_name: 'Free shipping',
              },
            },
          ]
        : undefined;

    const sessionParams: any = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url:
        successUrl ??
        `${getRuntimeOrigin()}/shop/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl ?? `${getRuntimeOrigin()}/shop/cart`,
      client_reference_id: userId,
      customer_email: shippingInfo?.email ?? user.email,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP'],
      },
      metadata: {
        coupon_codes: appliedCodes.join(','),
        discount_total_cents: String(discountTotalCents),
      },
    };

    if (shippingOptions) {
      sessionParams.shipping_options = shippingOptions;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

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
