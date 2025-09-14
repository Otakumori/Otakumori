import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma } from '@/app/lib/prisma';
import { debitPetals, ensureUserByClerkId } from '@/lib/petals';
import { rateLimit } from '@/app/api/rate-limit';
import { InventoryKind } from '@prisma/client';

export const runtime = 'nodejs';

const Body = z.object({ sku: z.string().min(1) });

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  // Basic RL to prevent hammering
  const rl = await rateLimit(req, { windowMs: 60_000, maxRequests: 6, keyPrefix: 'petalshop:purchase' }, userId);
  if (rl.limited) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = Body.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'bad_input' }, { status: 400 });

  const { sku } = parsed.data;
  try {
    const shopItem = await prisma.petalShopItem.findUnique({ where: { sku } });
    if (!shopItem) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
    const price = shopItem.pricePetals ?? 0;
    if (price <= 0) return NextResponse.json({ ok: false, error: 'not_for_sale' }, { status: 400 });

    const user = await ensureUserByClerkId(userId);
    const existing = await prisma.inventoryItem.findFirst({ where: { userId: user.id, sku } });
    if (existing) {
      return NextResponse.json({ ok: true, data: { alreadyOwned: true } });
    }

    const res = await debitPetals(userId, price, `purchase:${sku}`);
    await prisma.inventoryItem.create({
      data: {
        userId: user.id,
        sku,
        kind: InventoryKind.COSMETIC,
        metadata: { shopKind: shopItem.kind },
      },
    });

    return NextResponse.json({ ok: true, data: { balance: res.balance } });
  } catch (e: any) {
    const msg = e?.code === 'INSUFFICIENT_FUNDS' ? 'insufficient_funds' : e?.message || 'purchase_failed';
    const status = e?.code === 'INSUFFICIENT_FUNDS' ? 400 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}

