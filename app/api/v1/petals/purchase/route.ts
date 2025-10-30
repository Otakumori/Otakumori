export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { InventoryKind } from '@prisma/client';
import { z } from 'zod';

import { db } from '@/lib/db';

const PurchaseSchema = z.object({
  itemId: z.string().min(1),
  idempotencyKey: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = PurchaseSchema.parse(await request.json());

    const existingKey = await db.idempotencyKey.findUnique({
      where: { key: payload.idempotencyKey },
    });

    if (existingKey) {
      return NextResponse.json({ ok: false, error: 'Duplicate request' }, { status: 409 });
    }

    const user = await db.user.findUnique({
      where: { clerkId },
      select: { id: true, petalBalance: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    const item = await db.petalShopItem.findUnique({
      where: { id: payload.itemId },
    });

    if (!item) {
      return NextResponse.json({ ok: false, error: 'Item not found' }, { status: 404 });
    }

    if (item.pricePetals == null) {
      return NextResponse.json({ ok: false, error: 'Item has no price' }, { status: 400 });
    }

    if (user.petalBalance < item.pricePetals) {
      return NextResponse.json({ ok: false, error: 'Insufficient petals' }, { status: 400 });
    }

    const alreadyOwned = await db.inventoryItem.findFirst({
      where: {
        userId: user.id,
        sku: item.sku,
      },
      select: { id: true },
    });

    if (alreadyOwned) {
      return NextResponse.json({ ok: false, error: 'Item already owned' }, { status: 400 });
    }

    await db.idempotencyKey.create({
      data: {
        key: payload.idempotencyKey,
        method: 'POST',
        path: '/api/v1/petals/purchase',
        userId: user.id,
        response: '',  // Will be updated after transaction
        purpose: 'petal_purchase',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    const result = await db.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          petalBalance: {
            decrement: item.pricePetals ?? 0,
          },
        },
        select: { petalBalance: true },
      });

      const inventoryItem = await tx.inventoryItem.create({
        data: {
          userId: user.id,
          sku: item.sku,
          kind: normalizeInventoryKind(item.kind),
          metadata: {
            source: 'petal_shop',
            shopItemId: item.id,
            purchasedAt: new Date().toISOString(),
          },
        },
      });

      await tx.petalLedger.create({
        data: {
          userId: user.id,
          type: 'spend',
          amount: item.pricePetals ?? 0,
          reason: `Purchase:${item.sku}`,
        },
      });

      return {
        newBalance: updatedUser.petalBalance,
        inventoryItem,
      };
    });

    return NextResponse.json({
      ok: true,
      data: {
        itemId: result.inventoryItem.id,
        petalsSpent: item.pricePetals,
        newBalance: result.newBalance,
        item: {
          id: item.id,
          name: item.name,
          sku: item.sku,
          kind: item.kind,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: 'Invalid request data' }, { status: 400 });
    }

    console.error('Error processing petal purchase', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

function normalizeInventoryKind(kind: string | null | undefined): InventoryKind {
  if (!kind) {
    return InventoryKind.COSMETIC;
  }

  const normalized = kind.toUpperCase();
  const kindValue = (InventoryKind as Record<string, InventoryKind>)[normalized];
  if (kindValue) {
    return kindValue;
  }

  return InventoryKind.COSMETIC;
}
