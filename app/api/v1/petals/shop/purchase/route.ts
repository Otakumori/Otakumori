import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PetalService } from '@/app/lib/petals';
import { generateRequestId } from '@/lib/requestId';
import { checkRateLimit, getClientIdentifier } from '@/app/lib/rate-limiting';
import { db } from '@/lib/db';
import { getCosmeticItem, getContentRating } from '@/app/lib/cosmetics/cosmeticsConfig';
import { canAccessNSFWContent } from '@/app/lib/nsfw/user';

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

    // Get user
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, petalBalance: true, nsfwEnabled: true },
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

    // Validate NSFW permission for NSFW cosmetics
    const contentRating = getContentRating(item);
    if (contentRating !== 'sfw') {
      const canAccess = await canAccessNSFWContent(user.id, contentRating);
      if (!canAccess) {
        return NextResponse.json(
          {
            ok: false,
            error: 'NSFW_NOT_ALLOWED',
            message: 'NSFW cosmetics require age verification. Enable NSFW in settings.',
            requestId,
          },
          { status: 403 },
        );
      }
    }

    // Handle voucher cosmetics differently
    if (item.type === 'voucher') {
      // Check if user already has an unredeemed voucher of this type
      // For vouchers, we allow multiple purchases (they're consumables)
      // But we'll check if they have too many active vouchers
      const activeVouchers = await db.couponGrant.count({
        where: {
          userId: user.id,
          redeemedAt: null,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
      });

      // Limit to 10 active vouchers per user
      if (activeVouchers >= 10) {
        return NextResponse.json(
          {
            ok: false,
            error: 'TOO_MANY_VOUCHERS',
            message: 'You have too many active vouchers. Use or let some expire before purchasing more.',
            requestId,
          },
          { status: 400 },
        );
      }
    } else {
      // For non-voucher cosmetics, check if user already owns the item
      const existingItem = await db.inventoryItem.findFirst({
        where: {
          userId: user.id,
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
    }

    // Check user balance
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
      user.id,
      item.costPetals,
      `Purchased ${(item.type as string) === 'voucher' ? 'voucher' : 'cosmetic'}: ${item.name}`,
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

    // Handle voucher vs cosmetic differently
    // Type assertion needed because voucher type may not be in all CosmeticType unions
    if ((item.type as string) === 'voucher') {
      // Create CouponGrant record for voucher
      const voucherMetadata = item.metadata as {
        discountType?: string;
        percentOff?: number;
        amountOff?: number;
        maxDiscountCents?: number;
        minSpendCents?: number;
        validityDays?: number;
      } | undefined;

      const discountType = voucherMetadata?.discountType === 'FREESHIP' ? 'PERCENT' : (voucherMetadata?.discountType === 'OFF_AMOUNT' ? 'OFF_AMOUNT' : 'PERCENT');
      const percentOff = voucherMetadata?.percentOff || 0;
      const amountOff = voucherMetadata?.amountOff || null;
      const minSpendCents = voucherMetadata?.minSpendCents || null;
      const validityDays = voucherMetadata?.validityDays || 30;

      // Generate unique voucher code
      const voucherCode = `OM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      // Calculate expiry date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + validityDays);

      await db.couponGrant.create({
        data: {
          userId: user.id,
          code: voucherCode,
          discountType: discountType as any,
          percentOff: discountType === 'PERCENT' ? percentOff : null,
          amountOff: discountType === 'OFF_AMOUNT' ? (amountOff || 0) : null,
          expiresAt,
          petalCost: item.costPetals,
          minSpendCents,
        },
      });

      // Return voucher code in response
      return NextResponse.json({
        ok: true,
        data: {
          itemId,
          itemName: item.name,
          itemType: item.type,
          voucherCode,
          expiresAt: expiresAt.toISOString(),
          balance: spendResult.newBalance,
          lifetimePetalsEarned: spendResult.lifetimePetalsEarned,
        },
        requestId,
      });
    } else {
      // Create inventory item record for cosmetics
      await db.inventoryItem.create({
        data: {
          userId: user.id,
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
    }

    // Get updated wallet info (includes lifetime)
    const wallet = await db.petalWallet.findUnique({
      where: { userId: user.id },
      select: { balance: true, lifetimeEarned: true },
    });

    // Log purchase
    const { logger } = await import('@/app/lib/logger');
    logger.info(`${(item.type as string) === 'voucher' ? 'Voucher' : 'Cosmetic'} purchased`, {
      requestId,
      userId: user.id,
      extra: {
        itemId,
        itemName: item.name,
        itemType: item.type,
        costPetals: item.costPetals,
        rarity: item.rarity,
        contentRating: getContentRating(item),
        newBalance: wallet?.balance ?? spendResult.newBalance,
      },
    });

    const response = NextResponse.json({
      ok: true,
      data: {
        itemId,
        itemName: item.name,
        itemType: item.type,
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

