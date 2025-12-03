
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
import { getDiscountConfig } from '@/app/config/petalTuning';
import { logger } from '@/app/lib/logger';
import { generateRequestId } from '@/lib/requestId';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
});

// NOTE: This route should use the proper idempotency middleware instead of manual key creation

export async function POST(req: NextRequest) {
  return withRateLimit(req, rateLimitConfigs.api, async () => {
    // Check if Stripe is configured
    if (!env.STRIPE_SECRET_KEY) {
      logger.error('[checkout/session] Stripe not configured - missing STRIPE_SECRET_KEY');
      return NextResponse.json(
        { ok: false, error: 'Checkout temporarily unavailable. Please contact support.' },
        { status: 503 },
      );
    }

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
    // Includes both Coupon records and CouponGrant (petal-purchased vouchers)
    let appliedCodes: string[] = [];
    let discountTotalCents = 0;
    let shippingDiscountCents = 0;
    let discountedLineItems: { id: string; totalDiscountCents: number }[] = [];
    if (Array.isArray(couponCodes) && couponCodes.length > 0) {
      const codes = (couponCodes as string[]).map(normalizeCode);

      // Fetch regular Coupon records
      const couponRows = await prisma.coupon.findMany({ where: { code: { in: codes } } });

      // Get NSFW policy for validation
      const { getPolicyFromRequest } = await import('@/app/lib/policy/fromRequest');
      const policy = getPolicyFromRequest(req);
      const nsfwAllowed = policy.nsfwAllowed;

      // Fetch CouponGrant vouchers for this user (petal-purchased vouchers)
      const grantRows = await prisma.couponGrant.findMany({
        where: {
          userId: user.id,
          code: { in: codes },
          redeemedAt: null, // Not yet redeemed
          OR: [
            { expiresAt: null }, // No expiry
            { expiresAt: { gt: new Date() } }, // Not expired
          ],
        },
      });

      // Filter NSFW discounts if NSFW not allowed
      const validGrantRows = grantRows.filter((grant) => {
        if (grant.nsfwOnly && !nsfwAllowed) {
          logger.info('NSFW discount filtered out at checkout', {
            userId: user.id,
            extra: {
              couponCode: grant.code,
              discountRewardId: grant.discountRewardId,
              nsfwAllowed,
            },
          });
          return false;
        }
        return true;
      });

      // Convert Coupon records to CouponMeta
      const couponMetas: CouponMeta[] = couponRows.map((r: any) => ({
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

      // Convert CouponGrant vouchers to CouponMeta format
      const discountConfig = await getDiscountConfig();
      const grantMetas: CouponMeta[] = validGrantRows.map((g) => {
        // Validate discount percent doesn't exceed max
        const percentOff = g.percentOff || 0;
        const validPercent = Math.min(percentOff, discountConfig.maxPercent);

        return {
          id: g.id,
          code: g.code,
          type: g.discountType === 'PERCENT' ? 'PERCENT' : 'FIXED',
          valueCents: g.amountOff || 0,
          valuePct: validPercent > 0 ? validPercent : undefined,
          enabled: true,
          startsAt: g.createdAt,
          endsAt: g.expiresAt ?? undefined,
          maxRedemptions: 1, // Vouchers are single-use
          maxRedemptionsPerUser: 1,
          minSubtotalCents: g.minSpendCents || discountConfig.minOrderCents, // Use CouponGrant's minSpendCents if set
          allowedProductIds: [],
          excludedProductIds: [],
          allowedCollections: [],
          excludedCollections: [],
          stackable: false, // Vouchers don't stack
          oneTimeCode: true,
        };
      });

      // Combine both types
      const metas: CouponMeta[] = [...couponMetas, ...grantMetas];

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

      // Safety guard: Ensure discount never exceeds 100% of subtotal
      const maxAllowedDiscount = subtotalCents;
      if (discountTotalCents > maxAllowedDiscount) {
        logger.error('Discount exceeds subtotal - capping discount', {
          userId: user.id,
          extra: {
            discountTotalCents,
            subtotalCents,
            maxAllowedDiscount,
            appliedCodes,
          },
        });
        discountTotalCents = maxAllowedDiscount;
      }

      // Log discount application
      if (appliedCodes.length > 0) {
        const requestId = generateRequestId();
        logger.info('Discount applied at checkout', {
          requestId,
          userId: user.id,
          extra: {
            appliedCodes,
            discountTotalCents,
            shippingDiscountCents,
            subtotalCents,
            grantCodes: validGrantRows.map((g) => g.code),
            couponCodes: couponRows.map((c) => c.code),
          },
        });
      }

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
        User: { connect: { id: user.id } },
        stripeId: `temp_${Date.now()}`,
        totalAmount: subtotalCents,
        subtotalCents,
        currency: 'USD',
        status: 'pending',
        primaryItemName: items[0]?.name ?? 'Order',
        label: `Order for ${shippingInfo?.firstName ?? user.displayName ?? user.username}`,
        appliedCouponCodes: appliedCodes,
      },
    });

    for (const item of items) {
      await prisma.orderItem.create({
        data: {
          Order: { connect: { id: order.id } },
          Product: { connect: { id: item.productId } },
          ProductVariant: { connect: { id: item.variantId } },
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
                displayName: 'Free shipping',
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
      data: { stripeId: session.id },
    });

    return NextResponse.json({
      ok: true,
      data: { url: session.url, orderId: order.id, orderNumber: order.displayNumber },
    });
  });
}
