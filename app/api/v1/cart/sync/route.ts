import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db as prisma } from '@/lib/db';

interface SyncCartItem {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

interface SyncCartBody {
  items?: SyncCartItem[];
}

function isValidItem(item: unknown): item is SyncCartItem {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Record<string, unknown>;
  return (
    typeof candidate.productId === 'string' &&
    candidate.productId.length > 0 &&
    (candidate.variantId == null || typeof candidate.variantId === 'string') &&
    typeof candidate.quantity === 'number' &&
    Number.isInteger(candidate.quantity) &&
    candidate.quantity > 0
  );
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as SyncCartBody;
    const items = Array.isArray(body?.items) ? body.items : null;
    if (!items || !items.every(isValidItem)) {
      return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
    }

    const normalizedItems = items
      .filter((item) => item.quantity > 0)
      .map((item) => ({
        productId: item.productId,
        variantId: item.variantId ?? null,
        quantity: item.quantity,
      }));

    const productIds = [...new Set(normalizedItems.map((item) => item.productId))];
    const variantIds = [...new Set(normalizedItems.map((item) => item.variantId).filter((id): id is string => Boolean(id)))];

    const [products, variants] = await Promise.all([
      prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, ProductVariant: { select: { id: true, isEnabled: true, inStock: true } } },
      }),
      prisma.productVariant.findMany({
        where: { id: { in: variantIds } },
        select: { id: true, productId: true, isEnabled: true, inStock: true },
      }),
    ]);

    const productById = new Map(products.map((product) => [product.id, product]));
    const variantById = new Map(variants.map((variant) => [variant.id, variant]));

    const invalidItems = normalizedItems.filter((item) => {
      const product = productById.get(item.productId);
      if (!product) return true;

      const chosenVariantId = item.variantId ?? product.ProductVariant.find((variant) => variant.isEnabled && variant.inStock)?.id ?? null;
      if (!chosenVariantId) return true;

      const variant = variantById.get(chosenVariantId) ?? product.ProductVariant.find((candidate) => candidate.id === chosenVariantId);
      if (!variant) return true;
      if ('productId' in variant && variant.productId !== item.productId) return true;
      if (!variant.isEnabled || !variant.inStock) return true;
      return false;
    });

    if (invalidItems.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'One or more cart items are invalid.',
          invalidItems: invalidItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
          })),
        },
        { status: 400 },
      );
    }

    const cart = await prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    const syncedItems: Array<{ productId: string; variantId: string; quantity: number }> = [];

    await prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      for (const item of normalizedItems) {
        const product = productById.get(item.productId)!;
        const resolvedVariantId = item.variantId ?? product.ProductVariant.find((variant) => variant.isEnabled && variant.inStock)!.id;

        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId: item.productId,
            productVariantId: resolvedVariantId,
            quantity: item.quantity,
          },
        });

        syncedItems.push({
          productId: item.productId,
          variantId: resolvedVariantId,
          quantity: item.quantity,
        });
      }
    });

    return NextResponse.json({
      ok: true,
      data: syncedItems,
    });
  } catch (error) {
    const { logger } = await import('@/app/lib/logger');
    logger.error('Cart sync failed:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ ok: false, error: 'Failed to sync cart' }, { status: 500 });
  }
}
