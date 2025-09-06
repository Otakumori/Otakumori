// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db as prisma } from '@/lib/db';
import { CartItemSchema, CartUpdateSchema } from '@/app/lib/contracts';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create cart for user
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                ProductVariant: true,
              },
            },
            productVariant: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  ProductVariant: true,
                },
              },
              productVariant: true,
            },
          },
        },
      });
    }

    const response = cart.items.map(item => ({
      id: item.id,
      productId: item.productId,
      variantId: item.productVariantId,
      quantity: item.quantity,
      product: item.product,
    }));

    return NextResponse.json({ ok: true, data: response });
  } catch (error) {
    console.error('Error fetching cart:', error);
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

    if (variantId && !product.ProductVariant.find(v => v.id === variantId)) {
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
        product: {
          include: {
            ProductVariant: true,
          },
        },
        productVariant: true,
      },
    });

    const response = {
      id: cartItem.id,
      productId: cartItem.productId,
      variantId: cartItem.productVariantId,
      quantity: cartItem.quantity,
      product: cartItem.product,
    };

    return NextResponse.json({ ok: true, data: response });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
