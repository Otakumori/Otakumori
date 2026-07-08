import { type NextRequest, NextResponse } from 'next/server';
import { createApiError, createApiSuccess, generateRequestId } from '@/app/lib/api-contracts';
import { withAdminAuth } from '@/app/lib/auth/admin';
import { getMerchizeService } from '@/app/lib/merchize/service';

export const runtime = 'nodejs';

export const GET = withAdminAuth(async (_request: NextRequest) => {
  const requestId = generateRequestId();

  try {
    const products = await getMerchizeService().getProducts({ limit: 50, page: 1 });

    return NextResponse.json(
      createApiSuccess(
        {
          count: products.length,
          products: products.map((product) => ({
            id: product.id,
            title: product.title,
            sku: product.sku,
            status: product.status,
            price: product.price,
            imageCount: product.imageCount,
            variantCount: product.variantCount,
          })),
        },
        requestId,
      ),
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    const { logger } = await import('@/app/lib/logger');
    logger.error(
      'Merchize products admin API failed',
      { requestId, route: '/api/merchize/products' },
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );

    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to fetch Merchize products.', requestId),
      { status: 502 },
    );
  }
});
