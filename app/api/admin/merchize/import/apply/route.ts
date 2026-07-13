import { type NextRequest, NextResponse } from 'next/server';
import { createApiError, createApiSuccess, generateRequestId } from '@/app/lib/api-contracts';
import { withAdminAuth } from '@/app/lib/auth/admin';
import {
  applyMerchizeHiddenLocalImport,
  loadMerchizeImportPlan,
} from '@/app/lib/merchize/importPreflight';
import { limitApi } from '@/lib/ratelimit';

export const runtime = 'nodejs';

export const POST = withAdminAuth(async (request: NextRequest) => {
  const requestId = generateRequestId();
  const rateLimitKey = `admin:merchize:hidden-import-apply:${request.headers.get('x-forwarded-for') ?? 'local'}`;
  const rateLimit = await limitApi(rateLimitKey);

  if (!rateLimit.success) {
    return NextResponse.json(
      createApiError('RATE_LIMITED', 'Too many Merchize hidden import attempts.', requestId),
      {
        status: 429,
        headers: {
          'Cache-Control': 'no-store',
          'Retry-After': String(Math.max(1, Math.ceil((rateLimit.reset - Date.now()) / 1000))),
        },
      },
    );
  }

  const body = (await request.json().catch(() => null)) as { apply?: unknown } | null;
  if (body?.apply !== true) {
    return NextResponse.json(
      createApiError(
        'VALIDATION_ERROR',
        'Merchize hidden import requires explicit apply=true.',
        requestId,
      ),
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const { preflight, products } = await loadMerchizeImportPlan();
    if (!preflight.safeToImport) {
      return NextResponse.json(
        createApiError(
          'VALIDATION_ERROR',
          'Merchize hidden import preflight is not safe to apply.',
          requestId,
          preflight,
        ),
        { status: 409, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    const result = await applyMerchizeHiddenLocalImport(preflight, products);

    const { logger } = await import('@/app/lib/logger');
    logger.info('Merchize hidden local import completed', {
      requestId,
      route: '/api/admin/merchize/import/apply',
      extra: {
        productCount: result.productCount,
        inserted: result.inserted,
        updated: result.updated,
        skipped: result.skipped,
        blocked: result.blocked,
        public: false,
        purchasable: false,
      },
    });

    return NextResponse.json(createApiSuccess(result, requestId), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    const { logger } = await import('@/app/lib/logger');
    logger.error(
      'Merchize hidden local import failed',
      { requestId, route: '/api/admin/merchize/import/apply' },
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );

    return NextResponse.json(
      createApiError(
        'INTERNAL_ERROR',
        'Merchize hidden import failed. Check logs with the request ID.',
        requestId,
      ),
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
});
