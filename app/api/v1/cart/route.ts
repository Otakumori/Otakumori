import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { CartUpdateSchema } from '@/app/lib/contracts';
import {
  AuthenticationRequiredError,
  LocalUserUnavailableError,
  requireLocalViewer,
} from '@/app/lib/auth/viewer';
import { validateLoadedPrintifyPurchasableLineItem } from '@/lib/checkout/printifyPurchasable';

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
    logger.warn('Cart GET requested from:', undefined, {
      userAgent: req.headers.get('user-agent'),
    });

    const { localUserId } = await requireLocalViewer();

    let cart = await prisma.cart.findUnique({
      where: { userId: localUserId },
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
        data: { userId: localUserId },
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
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof LocalUserUnavailableError) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Account data is temporarily unavailable. Please try again shortly.',
        },
        { status: 503 },
      );
    }
    const { logger } = await import('@/app/lib/logger');
    logger.error(
      'Error fetching cart:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { localUserId } = await requireLocalViewer();

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

    const validation = validateLoadedPrintifyPurchasableLineItem(product, resolvedVariant.id);
    if (!validation.ok) {
      return NextResponse.json(
        { ok: false, error: validation.message, code: validation.code },
        { status: validation.status },
      );
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: localUserId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: localUserId },
      });
    }

    const cartItem = await prisma.cartItem.upsert({
      where: {
        cartId_productId_productVariantId: {
          cartId: cart.id,
          productId,
          productVariantId: validation.item.variantId,
        },
      },
      update: { quantity },
      create: {
        cartId: cart.id,
        productId,
        productVariantId: validation.item.variantId,
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
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof LocalUserUnavailableError) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Account data is temporarily unavailable. Please try again shortly.',
        },
        { status: 503 },
      );
    }
    const { logger } = await import('@/app/lib/logger');
    logger.error(
      'Error updating cart:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
