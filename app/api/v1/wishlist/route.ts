import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import {
  WishlistToggleSchema,
  createApiSuccess,
  createApiError,
  generateRequestId,
} from '../../../lib/api-contracts';
import { checkIdempotency, storeIdempotencyResponse } from '../../../lib/idempotency';
import { withRateLimit } from '../../../lib/rate-limiting';

export const runtime = 'nodejs';

// POST /api/v1/wishlist/toggle - Toggle wishlist item
export async function POST(req: NextRequest) {
  const requestId = generateRequestId();

  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        createApiError('AUTH_REQUIRED', 'Authentication required', requestId),
        {
          status: 401,
          headers: { 'x-otm-reason': 'AUTH_REQUIRED' },
        },
      );
    }

    // Check idempotency
    const idempotencyKey = req.headers.get('x-idempotency-key');
    if (idempotencyKey) {
      const idempotencyResult = await checkIdempotency(idempotencyKey);
      if (idempotencyResult.response) {
        return idempotencyResult.response;
      }
    }

    // Apply rate limiting
    const rateLimitedHandler = withRateLimit('WISHLIST_TOGGLE', async (req) => {
      // Parse and validate request body
      const body = await req.json();
      const validation = WishlistToggleSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          createApiError(
            'VALIDATION_ERROR',
            'Invalid request data',
            requestId,
            validation.error.issues,
          ),
          { status: 400 },
        );
      }

      const { productId } = validation.data;

      // Check if product exists
      const product = await db.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true, primaryImageUrl: true },
      });

      if (!product) {
        return NextResponse.json(createApiError('NOT_FOUND', 'Product not found', requestId), {
          status: 404,
        });
      }

      // Check if item is already in wishlist
      const existingItem = await db.wishlist.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });

      let isInWishlist: boolean;
      let wishlistItem;

      if (existingItem) {
        // Remove from wishlist
        await db.wishlist.delete({
          where: {
            userId_productId: {
              userId,
              productId,
            },
          },
        });
        isInWishlist = false;
      } else {
        // Add to wishlist
        wishlistItem = await db.wishlist.create({
          data: {
            userId,
            productId,
          },
        });
        isInWishlist = true;
      }

      const response = createApiSuccess(
        {
          productId,
          isInWishlist,
          product: {
            id: product.id,
            name: product.name,
            price: 0, // Placeholder - would need to get from ProductVariant
            imageUrl: product.primaryImageUrl,
          },
        },
        requestId,
      );

      // Store idempotency response
      const idempotencyKey = req.headers.get('idempotency-key');
      if (idempotencyKey) {
        await storeIdempotencyResponse(idempotencyKey, response);
      }

      return NextResponse.json(response, { status: 200 });
    });

    return rateLimitedHandler(req);
  } catch (error) {
    console.error('Error toggling wishlist item:', error);
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to toggle wishlist item', requestId),
      { status: 500 },
    );
  }
}

// GET /api/v1/wishlist - Get user's wishlist
export async function GET(req: NextRequest) {
  const requestId = generateRequestId();

  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        createApiError('AUTH_REQUIRED', 'Authentication required', requestId),
        {
          status: 401,
          headers: { 'x-otm-reason': 'AUTH_REQUIRED' },
        },
      );
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    const wishlistItems = await db.wishlist.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      include: {
        product: {
          select: {
            id: true,
            name: true,
            primaryImageUrl: true,
          },
        },
      },
    });

    const hasMore = wishlistItems.length > limit;
    const items = hasMore ? wishlistItems.slice(0, -1) : wishlistItems;
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

    return NextResponse.json(
      createApiSuccess(
        {
          items: items.map((item) => ({
            id: item.id,
            productId: item.productId,
            createdAt: item.createdAt,
            product: {
              id: item.product.id,
              name: item.product.name,
              price: 0, // Placeholder - would need to get from ProductVariant
              imageUrl: item.product.primaryImageUrl,
            },
          })),
          nextCursor,
          hasMore,
        },
        requestId,
      ),
    );
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to fetch wishlist', requestId),
      { status: 500 },
    );
  }
}
