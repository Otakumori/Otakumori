import { type NextRequest, NextResponse } from 'next/server';
import { createApiError, createApiSuccess, generateRequestId } from '@/app/lib/api-contracts';
import { withAdminAuth } from '@/app/lib/auth/admin';
import { getMerchizeService } from '@/app/lib/merchize/service';
import { limitApi } from '@/lib/ratelimit';

export const runtime = 'nodejs';

export const GET = withAdminAuth(async (request: NextRequest) => {
  const requestId = generateRequestId();
  const rateLimitKey = `admin:merchize:preflight:${request.headers.get('x-forwarded-for') ?? 'local'}`;
  const rateLimit = await limitApi(rateLimitKey);

  if (!rateLimit.success) {
    return NextResponse.json(
      createApiError('RATE_LIMITED', 'Too many Merchize preflight requests.', requestId),
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.max(1, Math.ceil((rateLimit.reset - Date.now()) / 1000))),
        },
      },
    );
  }

  try {
    const preflight = await getMerchizeService().preflightCatalog({ limit: 50, page: 1 });

    const { logger } = await import('@/app/lib/logger');
    logger.info('Merchize read-only preflight completed', {
      requestId,
      route: '/api/admin/merchize/preflight',
      extra: {
        productCount: preflight.productCount,
        normalizedProductCount: preflight.normalizedProductCount,
        safeToImport: preflight.safeToImport,
        issueCount: preflight.issues.length,
      },
    });

    return NextResponse.json(createApiSuccess(preflight, requestId), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    const { logger } = await import('@/app/lib/logger');
    logger.error('Merchize read-only preflight failed', {
      requestId,
      route: '/api/admin/merchize/preflight',
      extra: {
        failureCategory: error instanceof SyntaxError ? 'invalid_provider_payload' : 'provider',
      },
    });

    return NextResponse.json(
      createApiError(
        'INTERNAL_ERROR',
        'Merchize preflight failed. Check provider configuration and logs with the request ID.',
        requestId,
      ),
      { status: 502 },
    );
  }
});
