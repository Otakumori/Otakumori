import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { withAdminAuth } from '@/app/lib/auth/admin';
import { db } from '@/app/lib/db';
import { newRequestId } from '@/app/lib/requestId';

export const runtime = 'nodejs';

const ProductActionSchema = z.object({
  action: z.enum(['hide', 'restore', 'archive']),
  productIds: z.array(z.string().min(1)).min(1).max(100),
});

function getProvider(product: { printifyProductId: string | null; integrationRef: string | null }) {
  if (product.printifyProductId || product.integrationRef?.startsWith('printify:'))
    return 'printify';
  if (product.integrationRef?.startsWith('merchize:')) return 'merchize';
  return 'internal';
}

function getStatus(product: { active: boolean; visible: boolean }) {
  if (!product.active) return 'archived';
  if (!product.visible) return 'hidden';
  return 'visible';
}

function actionData(action: z.infer<typeof ProductActionSchema>['action']) {
  switch (action) {
    case 'hide':
      return { active: true, visible: false };
    case 'restore':
      return { active: true, visible: true };
    case 'archive':
      return { active: false, visible: false };
  }
}

function whereForStatus(status: string | null) {
  switch (status) {
    case 'visible':
      return { active: true, visible: true };
    case 'hidden':
      return { active: true, visible: false };
    case 'archived':
      return { active: false };
    default:
      return {};
  }
}

export const GET = withAdminAuth(async (request: NextRequest) => {
  const requestId = newRequestId();
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q')?.trim();
  const status = searchParams.get('status');
  const provider = searchParams.get('provider');
  const limit = Math.min(Math.max(Number(searchParams.get('limit') ?? 50), 1), 100);

  try {
    const products = await db.product.findMany({
      where: {
        ...whereForStatus(status),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { printifyProductId: { contains: q, mode: 'insensitive' } },
                { integrationRef: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        ProductImage: { orderBy: { position: 'asc' }, take: 1 },
        ProductVariant: {
          select: { isEnabled: true, inStock: true },
        },
        _count: {
          select: { OrderItem: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });

    const items = products
      .map((product) => {
        const productProvider = getProvider(product);
        const sellableVariantCount = product.ProductVariant.filter(
          (variant) => variant.isEnabled && variant.inStock,
        ).length;

        return {
          id: product.id,
          title: product.name,
          image: product.primaryImageUrl ?? product.ProductImage[0]?.url ?? null,
          provider: productProvider,
          printifyProductId: product.printifyProductId,
          integrationRef: product.integrationRef,
          status: getStatus(product),
          active: product.active,
          visible: product.visible,
          available: sellableVariantCount > 0,
          sellableVariantCount,
          historicalOrderCount: product._count.OrderItem,
          updatedAt: product.updatedAt.toISOString(),
          lastSyncedAt: product.lastSyncedAt?.toISOString() ?? null,
        };
      })
      .filter((product) => !provider || provider === 'all' || product.provider === provider);

    return NextResponse.json({ ok: true, data: { products: items }, requestId });
  } catch (error) {
    const { logger } = await import('@/app/lib/logger');
    logger.error(
      'admin_products_list_failed',
      { requestId, route: '/api/admin/products' },
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json(
      { ok: false, error: 'Failed to load products', requestId },
      { status: 500 },
    );
  }
});

export const PATCH = withAdminAuth(async (request: NextRequest) => {
  const requestId = newRequestId();

  try {
    const parsed = ProductActionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: 'Invalid product action', issues: parsed.error.flatten(), requestId },
        { status: 400 },
      );
    }

    const { action, productIds } = parsed.data;
    const result = await db.product.updateMany({
      where: { id: { in: productIds } },
      data: actionData(action),
    });

    const { logger } = await import('@/app/lib/logger');
    logger.info('admin_products_local_status_updated', {
      requestId,
      route: '/api/admin/products',
      extra: {
        action,
        requestedCount: productIds.length,
        updatedCount: result.count,
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        action,
        requestedCount: productIds.length,
        updatedCount: result.count,
      },
      requestId,
    });
  } catch (error) {
    const { logger } = await import('@/app/lib/logger');
    logger.error(
      'admin_products_local_status_failed',
      { requestId, route: '/api/admin/products' },
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json(
      { ok: false, error: 'Failed to update local product status', requestId },
      { status: 500 },
    );
  }
});
