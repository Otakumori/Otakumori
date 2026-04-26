import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db as prisma } from '@/lib/db';
import { CartUpdateSchema } from '@/app/lib/contracts';

function serializeCartItem(item: {
  id: string;
  productId: string;
  productVariantId: string;
  quantity: number;
  Product: { id: string; name: string; primaryImageUrl: string | null };
  ProductVariant: { id: string; title: string | null; priceCents: number | null };
}) {
  return {
    id: item.id,
    productId: item.productId,
    variantId: item.productVariantId,
    quantity: item.quantity,
    product: {
      id: item.Product.id,
      title: item.Product.name,
      image: item.Product.primaryImageUrl,
    },
    variant: {
      id: item.ProductVariant.id,
      title: item.ProductVariant.title,
      priceCents: item.ProductVariant.priceCents,
    },
  };
}

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
                name: true,
                primaryImageUrl: true,
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
                  name: true,
                  primaryImageUrl: true,
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

    return NextResponse.json({ ok: true, data: cart.CartItem.map(serializeCartItem) });
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

    const resolvedVariant = variantId
      ? product.ProductVariant.find((variant) => variant.id === variantId)
      : product.ProductVariant.find((variant) => variant.isEnabled && variant.inStock);

    if (!resolvedVariant) {
      return NextResponse.json({ ok: false, error: 'Variant not found' }, { status: 404 });
    }

    if (!resolvedVariant.isEnabled || !resolvedVariant.inStock) {
      return NextResponse.json({ ok: false, error: 'Variant is no longer available' }, { status: 400 });
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
          productVariantId: resolvedVariant.id,
        },
      },
      update: { quantity },
      create: {
        cartId: cart.id,
        productId,
        productVariantId: resolvedVariant.id,
        quantity,
      },
      include: {
        Product: {
          select: {
            id: true,
            name: true,
            primaryImageUrl: true,
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

    return NextResponse.json({ ok: true, data: serializeCartItem(cartItem) });
  } catch (error) {
    const { logger } = await import('@/app/lib/logger');
    logger.error('Error updating cart:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
