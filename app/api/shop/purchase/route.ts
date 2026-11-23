export const runtime = 'nodejs';
import { logger } from '@/app/lib/logger';
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { type InventoryKind } from '@prisma/client';
import { PetalSpendError, spendPetalsInTransaction } from '@/app/lib/petals/spend';

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
  if (needRunes && user.runes < needRunes) {
    return NextResponse.json({ ok: false, error: 'insufficient' }, { status: 402 });
  }

  // stock / event window (optional)
  if (item.visibleFrom && item.visibleFrom > new Date())
    return NextResponse.json({ ok: false, error: 'not_visible' }, { status: 403 });
  if (item.visibleTo && item.visibleTo < new Date())
    return NextResponse.json({ ok: false, error: 'expired' }, { status: 403 });

  // Execute purchase transaction
  try {
    await prisma.$transaction(async (tx) => {
      if (needRunes) {
        const runeDebit = await tx.user.updateMany({
          where: { id: user.id, runes: { gte: needRunes } },
          data: { runes: { decrement: needRunes } },
        });
        if (runeDebit.count !== 1) throw new Error('INSUFFICIENT_RUNES');
      }
      if (needPetals) {
        await spendPetalsInTransaction(
          tx,
          user.id,
          needPetals,
          `Purchased inventory item: ${item.sku}`,
          'shop_purchase',
        );
      }

      await tx.inventoryItem.create({
        data: { userId: user.id, sku: item.sku, kind: item.kind as InventoryKind },
      });
    });
  } catch (error) {
    if (
      (error instanceof PetalSpendError && error.code === 'INSUFFICIENT_PETALS') ||
      (error instanceof Error && error.message === 'INSUFFICIENT_RUNES')
    ) {
      return NextResponse.json({ ok: false, error: 'insufficient' }, { status: 402 });
    }
    throw error;
  }

  logger.warn('Shop purchase completed:', undefined, {
    userId: user.id,
    sku: item.sku,
    needRunes,
    needPetals,
  });
  return NextResponse.json({ ok: true });
}
