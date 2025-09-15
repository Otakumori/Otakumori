import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma } from '@/app/lib/prisma';
import { debitPetals, ensureUserByClerkId } from '@/lib/petals';
import { rateLimit } from '@/app/api/rate-limit';
import { InventoryKind } from '@prisma/client';
import { logger } from '@/app/lib/logger';
import { reqId } from '@/lib/log';
import { problem } from '@/lib/http/problem';

export const runtime = 'nodejs';

const Body = z.object({ sku: z.string().min(1) });

export async function POST(req: NextRequest) {
  const rid = reqId(req.headers);
  logger.request(req, 'POST /api/petal-shop/purchase');
  const { userId } = await auth();
  if (!userId) return NextResponse.json(problem(401, 'Unauthorized'), { status: 401 });

  // Basic RL to prevent hammering
  const rl = await rateLimit(req, { windowMs: 60_000, maxRequests: 6, keyPrefix: 'petalshop:purchase' }, userId);
  if (rl.limited) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = Body.safeParse(body);
  if (!parsed.success) return NextResponse.json(problem(400, 'Bad input'));

  const { sku } = parsed.data;
  try {
    const shopItem = await prisma.petalShopItem.findUnique({ where: { sku } });
    if (!shopItem) return NextResponse.json(problem(404, 'Not found'));
    const price = shopItem.pricePetals ?? 0;
    if (price <= 0) return NextResponse.json(problem(400, 'Not for sale'));

    const user = await ensureUserByClerkId(userId);
    // Handle coupons vs inventory
    if (shopItem.kind?.toUpperCase() === 'COUPON' || (shopItem.metadata as any)?.coupon) {
      const res = await debitPetals(userId, price, `purchase:${sku}`);
      const meta = (shopItem.metadata as any) || {};
      const coupon = meta.coupon || {};
      const type = coupon.type === 'OFF_AMOUNT' ? 'OFF_AMOUNT' : 'PERCENT';
      const amount = Number(coupon.amount) || 10;
      const ttlDays = Number(coupon.ttlDays) || 30;
      const code = `OM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const expiresAt = new Date(Date.now() + ttlDays * 86400000);
      await prisma.couponGrant.create({
        data: {
          userId: user.id,
          code,
          discountType: type as any,
          amountOff: type === 'OFF_AMOUNT' ? amount : null,
          percentOff: type === 'PERCENT' ? amount : null,
          expiresAt,
        },
      });
      return NextResponse.json({ ok: true, data: { balance: res.balance, code }, requestId: rid });
    } else {
      const existing = await prisma.inventoryItem.findFirst({ where: { userId: user.id, sku } });
      if (existing) {
        return NextResponse.json({ ok: true, data: { alreadyOwned: true }, requestId: rid });
      }
      const res = await debitPetals(userId, price, `purchase:${sku}`);
      const kind = (() => {
        const k = (shopItem.kind || '').toUpperCase();
        if (k in InventoryKind) return (k as keyof typeof InventoryKind) as any;
        return InventoryKind.COSMETIC as any;
      })();
      await prisma.inventoryItem.create({
        data: {
          userId: user.id,
          sku,
          kind,
          metadata: { shopKind: shopItem.kind },
        },
      });
    }

    return NextResponse.json({ ok: true, data: { balance: res.balance }, requestId: rid });
  } catch (e: any) {
    const msg = e?.code === 'INSUFFICIENT_FUNDS' ? 'Insufficient funds' : e?.message || 'purchase_failed';
    const status = e?.code === 'INSUFFICIENT_FUNDS' ? 400 : 500;
    logger.error('petal_shop_purchase_error', { requestId: rid }, { error: String(e?.message || e), sku });
    return NextResponse.json(problem(status, msg), { status });
  }
}
