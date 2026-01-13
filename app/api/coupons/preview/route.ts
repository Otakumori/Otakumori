import { rateLimit } from '@/app/api/rate-limit';
import { logger } from '@/app/lib/logger';
import { prisma } from '@/app/lib/prisma';
import { getApplicableCoupons, normalizeCode, type CouponMeta } from '@/lib/coupons/engine';
import { problem } from '@/lib/http/problem';
import { getRedis } from '../../../lib/redis';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const Body = z.object({
  codes: z.array(z.string()).default([]),
  cart: z.object({
    items: z
      .array(
        z.object({
          id: z.string(),
          productId: z.string().optional().nullable(),
          collectionIds: z.array(z.string()).optional().nullable(),
          quantity: z.number().int().positive(),
          unitPrice: z.number().finite().nonnegative(), // dollars
        }),
      )
      .default([]),
    shippingOptionId: z.string().optional().nullable(),
    shipping: z
      .object({
        provider: z.enum(['stripe', 'flat', 'other']).optional(),
        fee: z.number().nonnegative(),
      })
      .optional(),
  }),
});

export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, {
    windowMs: 60_000,
    maxRequests: 40,
    keyPrefix: 'coupons:preview',
  });
  if (rl.limited) return NextResponse.json({ ok: false, error: 'Rate limited' }, { status: 429 });
  logger.request(req, 'POST /api/coupons/preview');
  try {
    const body = await req.json().catch(() => null);
    const parsed = Body.safeParse(body);
    if (!parsed.success) return NextResponse.json(problem(400, 'Bad input'), { status: 400 });

    const codes = parsed.data.codes.map(normalizeCode).filter((c) => !!c);
    const items = parsed.data.cart.items;
    const shipping = parsed.data.cart.shipping ?? { provider: 'stripe' as const, fee: 0 };
    logger.warn(`Coupon preview requested for ${items?.length || 0} items`);

    // Fetch coupons metadata, cached briefly
    const metas: CouponMeta[] = [];
    for (const code of codes) {
      const cacheKey = `coupon:meta:${code}`;
      let cached: any = null;
      try {
        const redisClient = await getRedis();
        const cachedStr = await redisClient.get(cacheKey);
        cached = cachedStr ? JSON.parse(cachedStr) : null;
      } catch {}
      if (cached && cached.code) {
        metas.push({
          code: cached.code,
          type: cached.type,
          valueCents: cached.valueCents || 0,
          valuePct: cached.valuePct,
          enabled: cached.enabled,
          startsAt: cached.startsAt ? new Date(cached.startsAt) : new Date(),
          endsAt: cached.endsAt ? new Date(cached.endsAt) : undefined,
          maxRedemptions: cached.maxRedemptions,
          maxRedemptionsPerUser: cached.maxRedemptionsPerUser,
          minSubtotalCents: cached.minSubtotalCents,
          allowedProductIds: cached.allowedProductIds ?? [],
          excludedProductIds: cached.excludedProductIds ?? [],
          allowedCollections: cached.allowedCollections ?? [],
          excludedCollections: cached.excludedCollections ?? [],
          stackable: cached.stackable ?? false,
          oneTimeCode: cached.oneTimeCode ?? false,
        });
        continue;
      }

      const row = await prisma.coupon.findUnique({ where: { code } });
      if (!row) continue;
      const meta: CouponMeta = {
        code: row.code,
        type: row.type as any,
        valueCents: row.type === 'FIXED' ? row.valueCents : 0,
        valuePct: row.type === 'PERCENT' ? row.valueCents : undefined,
        enabled: row.enabled,
        startsAt: row.startsAt,
        endsAt: row.endsAt ?? undefined,
        maxRedemptions: row.maxRedemptions ?? undefined,
        maxRedemptionsPerUser: row.maxRedemptionsPerUser ?? undefined,
        minSubtotalCents: row.minSubtotalCents ?? undefined,
        allowedProductIds: row.allowedProductIds,
        excludedProductIds: row.excludedProductIds,
        allowedCollections: row.allowedCollections,
        excludedCollections: row.excludedCollections,
        stackable: row.stackable,
        oneTimeCode: row.oneTimeCode,
      };
      metas.push(meta);
      try {
        const redisClient = await getRedis();
        await redisClient.set(
          cacheKey,
          JSON.stringify({
            id: row.id,
            code: row.code,
            type: row.type,
            value: row.valueCents,
            valueCents: meta.valueCents ?? null,
            valuePct: meta.valuePct ?? null,
            enabled: row.enabled,
            startsAt: row.startsAt?.toISOString() ?? null,
            endsAt: row.endsAt?.toISOString() ?? null,
            maxRedemptions: row.maxRedemptions,
            maxRedemptionsPerUser: row.maxRedemptionsPerUser,
            minSubtotal: row.minSubtotalCents,
            minSubtotalCents: row.minSubtotalCents,
            allowedProductIds: row.allowedProductIds,
            excludedProductIds: row.excludedProductIds,
            allowedCollections: row.allowedCollections,
            excludedCollections: row.excludedCollections,
            stackable: row.stackable,
            oneTimeCode: row.oneTimeCode,
          }),
          'EX',
          60,
        );
      } catch {}
    }

    // Compute usage tallies for caps
    const usageByCode: Record<string, { total: number; perUser: number }> = {};
    // We cannot know user here; leave perUser as 0 for preview
    const tallies = await prisma.couponRedemption.groupBy({
      by: ['couponId', 'status'],
      where: { status: 'SUCCEEDED' },
      _count: { couponId: true },
    });
    const codeToId = new Map<string, string>();
    for (const m of metas) {
      const c = await prisma.coupon.findUnique({ where: { code: m.code }, select: { id: true } });
      if (c) codeToId.set(m.code, c.id);
    }
    for (const t of tallies) {
      const code = [...codeToId.entries()].find(([, v]) => v === t.couponId)?.[0];
      if (!code) continue;
      usageByCode[code] = { total: t._count.couponId, perUser: 0 };
    }

    const breakdown = await getApplicableCoupons({
      now: new Date(),
      items: items || [],
      shipping: shipping,
      coupons: metas,
      codesOrder: codes,
    });

    return NextResponse.json({ ok: true, data: breakdown });
  } catch (e: any) {
    logger.error(
      'coupons_preview_error',
      { route: '/api/coupons/preview' },
      { error: String(e?.message || e) },
    );
    return NextResponse.json(problem(500, 'preview_failed', e?.message), { status: 500 });
  }
}
