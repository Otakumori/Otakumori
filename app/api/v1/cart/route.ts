
import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db as prisma } from '@/lib/db';
import { CartUpdateSchema } from '@/app/lib/contracts';

export async function GET(req: NextRequest) {
  try {
    // Log cart request for analytics
    logger.warn('Cart GET requested from:', undefined, { userAgent: req.headers.get('user-agent') });

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create cart for user
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        CartItem: {
          include: {
            Product: {
              include: {
                ProductVariant: true,
              },
            },
            ProductVariant: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          CartItem: {
            include: {
              Product: {
                include: {
                  ProductVariant: true,
                },
              },
              ProductVariant: true,
            },
          },
        },
      });
    }

    const response = cart.CartItem.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.productVariantId,
      quantity: item.quantity,
      product: item.Product,
    }));

    return NextResponse.json({ ok: true, data: response });
  } catch (error) {
    logger.error('Error fetching cart:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = CartUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Invalid request data' }, { status: 400 });
    }

    const { productId, variantId, quantity } = parsed.data;

    // Verify product and variant exist
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { ProductVariant: true },
    });

    if (!product) {
      return NextResponse.json({ ok: false, error: 'Product not found' }, { status: 404 });
    }

    if (variantId && !product.ProductVariant.find((v) => v.id === variantId)) {
      return NextResponse.json({ ok: false, error: 'Variant not found' }, { status: 404 });
    }

    // Get or create cart for user
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    // Upsert cart item
    const cartItem = await prisma.cartItem.upsert({
      where: {
        cartId_productId_productVariantId: {
          cartId: cart.id,
          productId,
          productVariantId: variantId ?? product.ProductVariant[0]?.id ?? '',
        },
      },
      update: { quantity },
      create: {
        cartId: cart.id,
        productId,
        productVariantId: variantId ?? product.ProductVariant[0]?.id ?? '',
        quantity,
      },
      include: {
        Product: {
          include: {
            ProductVariant: true,
          },
        },
        ProductVariant: true,
      },
    });

    const response = {
      id: cartItem.id,
      productId: cartItem.productId,
      variantId: cartItem.productVariantId,
      quantity: cartItem.quantity,
      product: cartItem.Product,
    };

    return NextResponse.json({ ok: true, data: response });
  } catch (error) {
    logger.error('Error updating cart:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
