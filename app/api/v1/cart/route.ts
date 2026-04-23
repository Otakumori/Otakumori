
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db as prisma } from '@/lib/db';
import { CartUpdateSchema } from '@/app/lib/contracts';

export async function GET(req: NextRequest) {
  try {
    const { logger } = await import('@/app/lib/logger');
    logger.warn('Cart GET requested from:', undefined, { userAgent: req.headers.get('user-agent') });

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        CartItem: {
          include: {
            Product: {
              select: {
                id: true,
                title: true,
                image: true,
              },
            },
            ProductVariant: {
              select: {
                id: true,
                title: true,
                priceCents: true,
              },
            },
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
                select: {
                  id: true,
                  title: true,
                  image: true,
                },
              },
              ProductVariant: {
                select: {
                  id: true,
                  title: true,
                  priceCents: true,
                },
              },
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
      product: {
        id: item.Product.id,
        title: item.Product.title,
        image: item.Product.image,
      },
      variant: {
        id: item.ProductVariant.id,
        title: item.ProductVariant.title,
        priceCents: item.ProductVariant.priceCents,
      },
    }));

    return NextResponse.json({ ok: true, data: response });
  } catch (error) {
    const { logger } = await import('@/app/lib/logger');
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

    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

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
          select: {
            id: true,
            title: true,
            image: true,
          },
        },
        ProductVariant: {
          select: {
            id: true,
            title: true,
            priceCents: true,
          },
        },
      },
    });

    const response = {
      id: cartItem.id,
      productId: cartItem.productId,
      variantId: cartItem.productVariantId,
      quantity: cartItem.quantity,
      product: cartItem.Product,
      variant: cartItem.ProductVariant,
    };

    return NextResponse.json({ ok: true, data: response });
  } catch (error) {
    const { logger } = await import('@/app/lib/logger');
    logger.error('Error updating cart:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
