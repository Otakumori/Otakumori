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
import { generateRequestId } from '@/lib/requestId';
import { checkIdempotency, storeIdempotencyResponse } from '@/app/lib/idempotency';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
});

function isHttpUrl(value: unknown): value is string {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
}

export async function POST(req: NextRequest) {
  return withRateLimit(req, rateLimitConfigs.api, async () => {
    const requestId = generateRequestId();
    let stage = 'init';

    try {
      stage = 'config';
      if (!env.STRIPE_SECRET_KEY) {
        const { logger } = await import('@/app/lib/logger');
        logger.error('[checkout/session] Stripe not configured - missing STRIPE_SECRET_KEY');
        return NextResponse.json(
          { ok: false, error: 'Checkout temporarily unavailable. Please contact support.', requestId, stage },
          { status: 503 },
        );
      }

      stage = 'auth';
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json(
          { ok: false, error: 'Unauthorized', requestId, stage },
          { status: 401 },
        );
      }

      stage = 'idempotency_header';
      const idempotencyKey = req.headers.get('x-idempotency-key');
      if (!idempotencyKey) {
        return NextResponse.json(
          { ok: false, error: 'Missing idempotency key', requestId, stage },
          { status: 400 },
        );
      }

      stage = 'idempotency_check';
      const idempotencyResult = await checkIdempotency(idempotencyKey);
      if (!idempotencyResult.isNew && idempotencyResult.response) {
        return idempotencyResult.response;
      }

      stage = 'parse_request';
      const json = await req.json();
      const parsed = CheckoutRequest.safeParse(json);
      if (!parsed.success) {
        return NextResponse.json(
          { ok: false, error: 'Invalid request', requestId, stage, issues: parsed.error.flatten() },
          { status: 400 },
        );
      }

      const { items, successUrl, cancelUrl, shippingInfo, couponCodes, shipping } = parsed.data as any;

      stage = 'load_user';
      const user = await prisma.user.findFirst({ where: { clerkId: userId } });
      if (!user) {
        return NextResponse.json({ ok: false, error: 'User not found', requestId, stage }, { status: 404 });
      }

      stage = 'validate_items';
      const productIds = items.map((i: any) => i.productId).filter(Boolean);
      const variantIds = items.map((i: any) => i.variantId).filter(Boolean);

      const [dbProducts, dbVariants] = await Promise.all([
        prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true } }),
        prisma.productVariant.findMany({ where: { id: { in: variantIds } }, select: { id: true, productId: true } }),
      ]);

      const validProductIds = new Set(dbProducts.map((p) => p.id));
      const variantById = new Map(dbVariants.map((v) => [v.id, v]));

      const invalidItems = items.filter((item: any) => {
        if (!item.productId || !item.variantId) return true;
        if (!validProductIds.has(item.productId)) return true;
        const variant = variantById.get(item.variantId);
        if (!variant) return true;
        return variant.productId !== item.productId;
      });

      if (invalidItems.length > 0) {
        return NextResponse.json(
          {
            ok: false,
            error: 'One or more cart items are no longer valid. Please refresh your cart and try again.',
            requestId,
            stage,
            invalidItems: invalidItems.map((item: any) => ({
              productId: item.productId,
              variantId: item.variantId,
              name: item.name,
            })),
          },
          { status: 400 },
        );
      }

      stage = 'calculate_totals';
      const subtotalCents = items.reduce((sum: number, i: any) => sum + i.priceCents * i.quantity, 0);

      let appliedCodes: string[] = [];
      let discountTotalCents = 0;
      let shippingDiscountCents = 0;
      let discountedLineItems: { id: string; totalDiscountCents: number }[] = [];
      if (Array.isArray(couponCodes) && couponCodes.length > 0) {
        stage = 'coupons';
        const codes = (couponCodes as string[]).map(normalizeCode);
        const couponRows = await prisma.coupon.findMany({ where: { code: { in: codes } } });
        const { getPolicyFromRequest } = await import('@/app/lib/policy/fromRequest');
        const policy = getPolicyFromRequest(req);
        const nsfwAllowed = policy.nsfwAllowed;
        const grantRows = await prisma.couponGrant.findMany({
          where: {
            userId: user.id,
            code: { in: codes },
            redeemedAt: null,
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
        });
        const validGrantRows = grantRows.filter((grant) => !(grant.nsfwOnly && !nsfwAllowed));
        const couponMetas: CouponMeta[] = couponRows.map((r: any) => ({
          id: r.id,
          code: r.code,
          type: r.type as any,
          valueCents: r.valueCents,
          valuePct: r.type === 'PERCENT' ? r.valueCents : undefined,
          enabled: r.enabled,
          startsAt: r.startsAt,
          endsAt: r.endsAt ?? undefined,
          maxRedemptions: r.maxRedemptions ?? undefined,
          maxRedemptionsPerUser: r.maxRedemptionsPerUser ?? undefined,
          minSubtotalCents: r.minSubtotalCents ?? undefined,
          allowedProductIds: r.allowedProductIds,
          excludedProductIds: r.excludedProductIds,
          allowedCollections: r.allowedCollections,
          excludedCollections: r.excludedCollections,
          stackable: r.stackable,
          oneTimeCode: r.oneTimeCode,
        }));
        const discountConfig = await getDiscountConfig();
        const grantMetas: CouponMeta[] = validGrantRows.map((g) => ({
          id: g.id,
          code: g.code,
          type: g.discountType === 'PERCENT' ? 'PERCENT' : 'FIXED',
          valueCents: g.amountOff || 0,
          valuePct: g.percentOff ? Math.min(g.percentOff, discountConfig.maxPercent) : undefined,
          enabled: true,
          startsAt: g.createdAt,
          endsAt: g.expiresAt ?? undefined,
          maxRedemptions: 1,
          maxRedemptionsPerUser: 1,
          minSubtotalCents: g.minSpendCents || discountConfig.minOrderCents,
          allowedProductIds: [],
          excludedProductIds: [],
          allowedCollections: [],
          excludedCollections: [],
          stackable: false,
          oneTimeCode: true,
        }));
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
          shipping: shipping ? { provider: shipping.provider ?? 'stripe', fee: shipping.fee ?? 0 } : { provider: 'stripe', fee: 0 },
          coupons: metas,
          codesOrder: codes,
        });
        appliedCodes = breakdown.normalizedCodes;
        discountTotalCents = Math.round(breakdown.discountTotal * 100);
        shippingDiscountCents = Math.round(breakdown.shippingDiscount * 100);
        const itemTotals = items.map((i: any) => ({
          key: i.productId ?? i.sku ?? i.variantId ?? i.name,
          quantity: i.quantity,
          unit: i.priceCents,
          total: i.priceCents * i.quantity,
        }));
        const discountsPerItem: Record<string, number> = {};
        const nonShipDiscountCents = discountTotalCents - shippingDiscountCents;
        if (nonShipDiscountCents > 0) {
          const total = itemTotals.reduce((s: number, it: any) => s + it.total, 0);
          let acc = 0;
          itemTotals.forEach((it: any, idx: number) => {
            let d = Math.floor((nonShipDiscountCents * it.total) / total);
            if (idx === itemTotals.length - 1) d = nonShipDiscountCents - acc;
            discountsPerItem[it.key] = d;
            acc += d;
          });
        }
        discountedLineItems = itemTotals.map((it: any) => ({ id: it.key, totalDiscountCents: discountsPerItem[it.key] ?? 0 }));
      }

      stage = 'create_order';
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

      stage = 'create_order_items';
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
            printifyVariantId: typeof item.printifyVariantId === 'number' ? item.printifyVariantId : null,
          },
        });
      }

      stage = 'build_line_items';
      const lineItems = items.map((i: any) => {
        const key = i.productId ?? i.sku ?? i.variantId ?? i.name;
        const totalDiscount = discountedLineItems.find((d) => d.id === key)?.totalDiscountCents ?? 0;
        const qty = i.quantity;
        const perItemBase = i.priceCents;
        const perItemDiscount = Math.floor(totalDiscount / qty);
        const productData: Record<string, unknown> = { name: i.name };
        if (typeof i.description === 'string' && i.description.trim()) {
          productData.description = i.description.trim().slice(0, 500);
        }
        if (Array.isArray(i.images)) {
          const validImages = i.images.filter(isHttpUrl).slice(0, 8);
          if (validImages.length > 0) productData.images = validImages;
        }
        return {
          price_data: {
            currency: 'usd',
            product_data: productData,
            unit_amount: Math.max(0, perItemBase - perItemDiscount),
          },
          quantity: qty,
        } as Stripe.Checkout.SessionCreateParams.LineItem;
      });

      const original = subtotalCents;
      const discountedSum = lineItems.reduce((s: number, li: any) => s + (li.price_data.unit_amount as number) * (li.quantity as number), 0);
      const nonShipDiscountCents = discountTotalCents - shippingDiscountCents;
      const target = original - Math.max(0, nonShipDiscountCents);
      let delta = discountedSum - target;
      if (delta !== 0 && lineItems.length > 0) {
        for (let i = 0; i < lineItems.length && delta !== 0; i++) {
          const li: any = lineItems[i];
          const canReduce = Math.min(delta, li.price_data.unit_amount - 0);
          if (canReduce > 0) {
            li.price_data.unit_amount -= canReduce;
            delta -= canReduce;
          }
        }
      }

      const shippingOptions = shippingDiscountCents > 0
        ? [{ shipping_rate_data: { type: 'fixed_amount', fixed_amount: { amount: 0, currency: 'usd' }, display_name: 'Free shipping' } }]
        : undefined;

      stage = 'create_stripe_session';
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: successUrl ?? `${getRuntimeOrigin()}/shop/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl ?? `${getRuntimeOrigin()}/shop/cart`,
        client_reference_id: userId,
        customer_email: shippingInfo?.email ?? user.email,
        shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP'] },
        metadata: {
          coupon_codes: appliedCodes.join(','),
          discount_total_cents: String(discountTotalCents),
          request_id: requestId,
        },
      };

      if (shippingOptions) sessionParams.shipping_options = shippingOptions as any;

      const session = await stripe.checkout.sessions.create(sessionParams);

      stage = 'update_order';
      await prisma.order.update({ where: { id: order.id }, data: { stripeId: session.id } });

      const responseBody = {
        ok: true,
        data: { url: session.url, orderId: order.id, orderNumber: order.displayNumber },
        requestId,
      };

      stage = 'store_idempotency';
      if (idempotencyKey) {
        await storeIdempotencyResponse(idempotencyKey, responseBody);
      }

      return NextResponse.json(responseBody);
    } catch (error) {
      const { logger } = await import('@/app/lib/logger');
      logger.error('[checkout/session] unhandled server error', undefined, { requestId, stage }, error instanceof Error ? error : new Error(String(error)));
      return NextResponse.json(
        {
          ok: false,
          error: error instanceof Error ? error.message : 'Unhandled checkout session error',
          requestId,
          stage,
        },
        { status: 500 },
      );
    }
  });
}
