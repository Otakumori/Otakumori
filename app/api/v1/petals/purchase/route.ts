 
 
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

const PurchaseRequestSchema = z.object({
  itemId: z.string().min(1),
  idempotencyKey: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request
    const body = await request.json();
    const validatedData = PurchaseRequestSchema.parse(body);

    // Check idempotency
    const existingKey = await db.idempotencyKey.findUnique({
      where: { key: validatedData.idempotencyKey },
    });

    if (existingKey) {
      return NextResponse.json({ ok: false, error: 'Duplicate request' }, { status: 409 });
    }

    // Create idempotency key
    await db.idempotencyKey.create({
      data: { key: validatedData.idempotencyKey, purpose: 'petal_purchase' },
    });

    // Get user
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // Get shop item
    const shopItem = await db.petalShopItem.findUnique({
      where: { id: validatedData.itemId },
    });

    if (!shopItem) {
      return NextResponse.json({ ok: false, error: 'Item not found' }, { status: 404 });
    }

    // Check if user has enough petals
    if (!shopItem.pricePetals) {
      return NextResponse.json({ ok: false, error: 'Item has no price set' }, { status: 400 });
    }

    if (user.petalBalance < shopItem.pricePetals) {
      return NextResponse.json({ ok: false, error: 'Insufficient petals' }, { status: 400 });
    }

    // Check if user already owns this item
    const existingItem = await db.inventoryItem.findFirst({
      where: {
        userId: user.id,
        sku: shopItem.sku,
      },
    });

    if (existingItem) {
      return NextResponse.json({ ok: false, error: 'Item already owned' }, { status: 400 });
    }

    // Begin transaction
    const result = await db.$transaction(async (tx) => {
      // Deduct petals from user balance
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { petalBalance: { decrement: shopItem.pricePetals! } },
      });

      // Add item to user's inventory
      const inventoryItem = await tx.inventoryItem.create({
        data: {
          userId: user.id,
          sku: shopItem.sku,
          kind: shopItem.kind as any, // Cast to InventoryKind enum
          metadata: {
            source: 'purchase',
            shopItemId: shopItem.id,
            purchasedAt: new Date().toISOString(),
          },
        },
      });

      // Record the transaction in petal ledger
      const petalTransaction = await tx.petalLedger.create({
        data: {
          userId: user.id,
          type: 'spend',
          amount: shopItem.pricePetals!,
          reason: `Purchase: ${shopItem.name}`,
        },
      });

      return {
        updatedUser,
        inventoryItem,
        petalTransaction,
      };
    });

    return NextResponse.json({
      ok: true,
      data: {
        itemId: result.inventoryItem.id,
        petalsSpent: shopItem.pricePetals,
        newBalance: result.updatedUser.petalBalance,
        item: {
          id: shopItem.id,
          name: shopItem.name,
          sku: shopItem.sku,
          kind: shopItem.kind,
        },
      },
    });
  } catch (error) {
    console.error('Error processing purchase:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: 'Invalid request data' }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
