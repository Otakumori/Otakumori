// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { type InventoryKind } from '@prisma/client';

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ ok: false, error: 'auth' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { sku } = body as { sku?: string };
  if (!sku) return NextResponse.json({ ok: false, error: 'bad_input' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ ok: false, error: 'no_user' }, { status: 400 });

  const item = await prisma.petalShopItem.findUnique({ where: { sku } });
  if (!item) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });

  // prevent double-buy for infinite digital
  const already = await prisma.inventoryItem.findFirst({ where: { userId: user.id, sku } });
  if (already) return NextResponse.json({ ok: false, error: 'owned' }, { status: 409 });

  // price check
  const needRunes = item.priceRunes ?? 0;
  const needPetals = item.pricePetals ?? 0;
  if ((needRunes && user.runes < needRunes) || (needPetals && user.petalBalance < needPetals)) {
    return NextResponse.json({ ok: false, error: 'insufficient' }, { status: 402 });
  }

  // stock / event window (optional)
  if (item.visibleFrom && item.visibleFrom > new Date())
    return NextResponse.json({ ok: false, error: 'not_visible' }, { status: 403 });
  if (item.visibleTo && item.visibleTo < new Date())
    return NextResponse.json({ ok: false, error: 'expired' }, { status: 403 });

  const res = await prisma.$transaction(async (tx) => {
    if (needRunes)
      await tx.user.update({ where: { id: user.id }, data: { runes: { decrement: needRunes } } });
    if (needPetals)
      await tx.user.update({
        where: { id: user.id },
        data: { petalBalance: { decrement: needPetals } },
      });

    await tx.inventoryItem.create({
      data: { userId: user.id, sku: item.sku, kind: item.kind as InventoryKind },
    });

    // optional: create CouponGrant if the item issues a coupon (not in this batch)
  });

  return NextResponse.json({ ok: true });
}
