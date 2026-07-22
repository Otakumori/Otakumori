import { type NextRequest, NextResponse } from 'next/server';
import { createApiError, createApiSuccess, generateRequestId } from '@/app/lib/api-contracts';
import { withAdminAuth } from '@/app/lib/auth/admin';
import { buildMerchizeImportPreflight } from '@/app/lib/merchize/importPreflight';
import { limitApi } from '@/lib/ratelimit';

export const runtime = 'nodejs';

export const GET = withAdminAuth(async (request: NextRequest) => {
  const requestId = generateRequestId();
  const rateLimitKey = `admin:merchize:import-preflight:${request.headers.get('x-forwarded-for') ?? 'local'}`;
  const rateLimit = await limitApi(rateLimitKey);

  if (!rateLimit.success) {
    return NextResponse.json(
      createApiError('RATE_LIMITED', 'Too many Merchize import preflight requests.', requestId),
      {
        status: 429,
        headers: {
          'Cache-Control': 'no-store',
          'Retry-After': String(Math.max(1, Math.ceil((rateLimit.reset - Date.now()) / 1000))),
        },
      },
    );
  }

  try {
    const preflight = await buildMerchizeImportPreflight();

    const { logger } = await import('@/app/lib/logger');
    logger.info('Merchize import preflight completed', {
      requestId,
      route: '/api/admin/merchize/import/preflight',
      extra: {
        productCount: preflight.productCount,
        catalogScope: preflight.catalogScope,
        completeness: preflight.completeness,
        wouldInsert: preflight.wouldInsert,
        wouldUpdate: preflight.wouldUpdate,
        wouldBlock: preflight.wouldBlock,
        safeToImport: preflight.safeToImport,
      },
    });

    return NextResponse.json(createApiSuccess(preflight, requestId), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    const { logger } = await import('@/app/lib/logger');
    logger.error('Merchize import preflight failed', {
      requestId,
      route: '/api/admin/merchize/import/preflight',
      extra: {
        failureCategory: error instanceof SyntaxError ? 'invalid_provider_payload' : 'provider',
      },
    });

    return NextResponse.json(
      createApiError(
        'INTERNAL_ERROR',
        'Merchize import preflight failed. Check provider configuration and logs with the request ID.',
        requestId,
      ),
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
});
