import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PetalService } from '@/app/lib/petals';
import { generateRequestId } from '@/lib/requestId';
import { checkRateLimit, getClientIdentifier } from '@/app/lib/rate-limiting';
import { db } from '@/lib/db';
import { getCosmeticItem } from '@/app/lib/cosmetics/cosmeticsConfig';

export const runtime = 'nodejs';

const PurchaseSchema = z.object({
  itemId: z.string().min(1),
});

// Rate limit config for purchases
const PURCHASE_RATE_LIMIT = {
  windowMs: 60000, // 1 minute
  maxRequests: 5, // 5 purchases per minute
  message: 'Too many purchase requests. Please wait a moment.',
};

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();

  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'AUTH_REQUIRED',
          message: 'You must be signed in to purchase items',
          requestId,
        },
        { status: 401 },
      );
    }

    // Rate limiting
    const identifier = getClientIdentifier(req, userId);
    const rateLimitResult = await checkRateLimit('PETAL_SHOP_PURCHASE', identifier, PURCHASE_RATE_LIMIT);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'RATE_LIMITED',
          message: rateLimitResult.message,
          requestId,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        },
      );
    }

    const body = await req.json();
    const validation = PurchaseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: 'VALIDATION_ERROR', details: validation.error.issues, requestId },
        { status: 400 },
      );
    }

    const { itemId } = validation.data;

    // Get cosmetic item
    const item = getCosmeticItem(itemId);
    if (!item) {
      return NextResponse.json(
        {
          ok: false,
          error: 'ITEM_NOT_FOUND',
          message: 'Item not found in shop',
          requestId,
        },
        { status: 404 },
      );
    }

    // Check if user already owns the item (check inventory)
    const existingItem = await db.inventoryItem.findFirst({
      where: {
        userId,
        sku: itemId,
      },
    });

    if (existingItem) {
      return NextResponse.json({
        ok: true,
        data: {
          alreadyOwned: true,
          balance: null,
        },
        requestId,
      });
    }

    // Check user balance
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { petalBalance: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found',
          requestId,
        },
        { status: 404 },
      );
    }

    if (user.petalBalance < item.costPetals) {
      return NextResponse.json(
        {
          ok: false,
          error: 'INSUFFICIENT_FUNDS',
          message: `Insufficient petals. You need ${item.costPetals} petals but have ${user.petalBalance}.`,
          requestId,
        },
        { status: 400 },
      );
    }

    // Spend petals
    const petalService = new PetalService();
    const spendResult = await petalService.spendPetals(
      userId,
      item.costPetals,
      `Purchased cosmetic: ${item.name}`,
      requestId,
    );

    if (!spendResult.success) {
      return NextResponse.json(
        {
          ok: false,
          error: spendResult.error || 'Failed to spend petals',
          requestId,
        },
        { status: 500 },
      );
    }

    // Create inventory item record
    await db.inventoryItem.create({
      data: {
        userId,
        sku: itemId,
        kind: 'COSMETIC',
        metadata: {
          itemId,
          itemName: item.name,
          itemType: item.type,
          hudSkinId: item.hudSkinId,
          purchasedAt: new Date().toISOString(),
        },
      },
    });

    // Get updated wallet info (includes lifetime)
    const wallet = await db.petalWallet.findUnique({
      where: { userId },
      select: { balance: true, lifetimeEarned: true },
    });

    // Log cosmetic purchase
    const { logger } = await import('@/app/lib/logger');
    logger.info('Cosmetic purchased', {
      requestId,
      userId,
      extra: {
        itemId,
        itemName: item.name,
        itemType: item.type,
        costPetals: item.costPetals,
        rarity: item.rarity,
        contentRating: item.contentRating,
        newBalance: wallet?.balance ?? spendResult.newBalance,
      },
    });

    const response = NextResponse.json({
      ok: true,
      data: {
        itemId,
        itemName: item.name,
        balance: wallet?.balance ?? spendResult.newBalance,
        lifetimePetalsEarned: wallet?.lifetimeEarned ?? spendResult.lifetimePetalsEarned,
        alreadyOwned: false,
      },
      requestId,
    });

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());

    return response;
  } catch (error: any) {
    console.error('[Petal Shop Purchase] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR', message: error.message, requestId },
      { status: 500 },
    );
  }
}

