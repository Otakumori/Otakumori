import { randomUUID, timingSafeEqual } from 'node:crypto';
import { auth } from '@clerk/nextjs/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { type NextRequest, NextResponse } from 'next/server';

import { logger } from '@/app/lib/logger';
import { getPrintifyService, type PrintifyProduct } from '@/app/lib/printify/service';
import { db } from '@/app/lib/db';
import { env } from '@/env/server';
import { syncPrintifyProducts } from '@/lib/catalog/printifySync';

export const runtime = 'nodejs';

const ROUTE = '/api/v1/printify/sync';
const APPLY_LOCK_KEY = 'otakumori:catalog-sync:apply-lock';
const APPLY_LOCK_TTL_SECONDS = 10 * 60;
const RELEASE_APPLY_LOCK_SCRIPT = `
if redis.call("GET", KEYS[1]) == ARGV[1] then
  return redis.call("DEL", KEYS[1])
end
return 0
`;

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

const preflightRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '10 m'),
  prefix: 'otakumori:catalog-sync:preflight-rate',
});

const applyRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1, '10 m'),
  prefix: 'otakumori:catalog-sync:apply-rate',
});

type AuthContext = {
  kind: 'internal' | 'admin';
  userId?: string;
};

type ValidationIssue = {
  productId: string;
  reason: string;
};

type CatalogSyncRequestBody = {
  operation?: string;
  mode?: string;
  type?: string;
  apply?: boolean;
  hideMissing?: boolean;
};

type PreflightSummary = {
  productCount: number;
  variantCount: number;
  enabledInStockVariantCount: number;
  imageCount: number;
  invalidProductCount: number;
  productsMissingUsableImages: number;
  productsMissingEnabledVariants: number;
  productsMissingValidPrices: number;
  duplicatePrintifyProductIdCount: number;
  duplicateVariantIdCount: number;
  existingPrintifyProductCount: number;
  wouldInsert: number;
  wouldUpdate: number;
  wouldHide: number;
  wouldSkip: number;
  hideMissing: boolean;
  safeToApply: boolean;
  issues: ValidationIssue[];
};

function hasValue(value: string | undefined | null): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function getRequestId(request: NextRequest) {
  return (
    request.headers.get('x-request-id') || request.headers.get('x-correlation-id') || randomUUID()
  );
}

function json(body: Record<string, unknown>, init?: ResponseInit, requestId?: string) {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  if (requestId) headers.set('x-request-id', requestId);
  return NextResponse.json(body, { ...init, headers });
}

function safeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function extractInternalToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization') ?? '';
  const bearerToken = authHeader.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  const internalHeader = request.headers.get('x-internal-auth')?.trim();

  return bearerToken || internalHeader || '';
}

function readRole(claims: unknown) {
  const record = claims as
    | {
        metadata?: { role?: unknown };
        public_metadata?: { role?: unknown };
        publicMetadata?: { role?: unknown };
        private_metadata?: { role?: unknown };
      }
    | null
    | undefined;

  return (
    record?.metadata?.role ||
    record?.public_metadata?.role ||
    record?.publicMetadata?.role ||
    record?.private_metadata?.role
  );
}

async function authorize(request: NextRequest, requestId: string): Promise<AuthContext | Response> {
  const suppliedInternalToken = extractInternalToken(request);
  const expectedInternalToken = env.INTERNAL_AUTH_TOKEN?.trim();

  if (hasValue(suppliedInternalToken)) {
    if (
      !hasValue(expectedInternalToken) ||
      !safeEquals(suppliedInternalToken, expectedInternalToken)
    ) {
      logger.warn('printify_catalog_sync_forbidden', {
        requestId,
        route: ROUTE,
        extra: { reason: 'invalid_internal_token' },
      });
      return json({ ok: false, error: 'Forbidden', requestId }, { status: 403 }, requestId);
    }

    return { kind: 'internal' };
  }

  let authResult: Awaited<ReturnType<typeof auth>>;
  try {
    authResult = await auth();
  } catch {
    logger.warn('printify_catalog_sync_unauthorized', {
      requestId,
      route: ROUTE,
      extra: { reason: 'auth_unavailable' },
    });
    return json({ ok: false, error: 'Unauthorized', requestId }, { status: 401 }, requestId);
  }

  if (!authResult.userId) {
    return json({ ok: false, error: 'Unauthorized', requestId }, { status: 401 }, requestId);
  }

  if (readRole(authResult.sessionClaims) !== 'admin') {
    logger.warn('printify_catalog_sync_forbidden', {
      requestId,
      route: ROUTE,
      userId: authResult.userId,
      extra: { reason: 'non_admin_user' },
    });
    return json({ ok: false, error: 'Forbidden', requestId }, { status: 403 }, requestId);
  }

  return { kind: 'admin', userId: authResult.userId };
}

function rateLimitIdentity(authContext: AuthContext) {
  return authContext.kind === 'internal' ? 'internal' : `admin:${authContext.userId ?? 'unknown'}`;
}

async function enforceDistributedRateLimit(
  authContext: AuthContext,
  operation: 'preflight' | 'apply',
  requestId: string,
) {
  const limiter = operation === 'apply' ? applyRateLimit : preflightRateLimit;
  const key = `${operation}:${rateLimitIdentity(authContext)}`;

  try {
    const result = await limiter.limit(key);
    if (result.success) return null;

    const retryAfterSeconds = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
    return json(
      { ok: false, error: 'Rate limit exceeded', requestId },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSeconds),
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': String(result.remaining),
          'X-RateLimit-Reset': String(Math.ceil(result.reset / 1000)),
        },
      },
      requestId,
    );
  } catch {
    logger.error('printify_catalog_sync_rate_limit_unavailable', {
      requestId,
      route: ROUTE,
      extra: { operation },
    });
    return json(
      { ok: false, error: 'Catalog sync rate limit unavailable.', requestId },
      { status: 503 },
      requestId,
    );
  }
}

async function acquireApplyLock(requestId: string) {
  const ownerToken = randomUUID();

  try {
    const acquired = await redis.set(APPLY_LOCK_KEY, ownerToken, {
      nx: true,
      ex: APPLY_LOCK_TTL_SECONDS,
    });

    if (acquired !== 'OK') {
      return {
        ownerToken: null,
        response: json(
          { ok: false, error: 'Catalog sync already running.', requestId },
          { status: 409 },
          requestId,
        ),
      };
    }

    return { ownerToken, response: null };
  } catch {
    logger.error('printify_catalog_sync_lock_unavailable', {
      requestId,
      route: ROUTE,
      extra: { operation: 'apply' },
    });
    return {
      ownerToken: null,
      response: json(
        { ok: false, error: 'Catalog sync lock unavailable.', requestId },
        { status: 503 },
        requestId,
      ),
    };
  }
}

async function releaseApplyLock(ownerToken: string, requestId: string) {
  try {
    await redis.eval(RELEASE_APPLY_LOCK_SCRIPT, [APPLY_LOCK_KEY], [ownerToken]);
  } catch {
    logger.error('printify_catalog_sync_lock_release_failed', {
      requestId,
      route: ROUTE,
      extra: { operation: 'apply' },
    });
  }
}

async function parseBody(request: NextRequest): Promise<CatalogSyncRequestBody> {
  const text = await request.text();
  if (!text.trim()) return {};

  const parsed = JSON.parse(text);
  return parsed && typeof parsed === 'object' ? (parsed as CatalogSyncRequestBody) : {};
}

function normalizeOperation(body: CatalogSyncRequestBody) {
  const requested = (body.operation || body.mode || body.type || 'preflight').toLowerCase();

  if (requested === 'test') return 'preflight';
  if (requested === 'products') return 'apply';
  return requested;
}

function sanitizeError(error: unknown) {
  if (error instanceof SyntaxError) return 'Invalid JSON request body.';
  if (error instanceof Error && error.name === 'AbortError') return 'Provider request timed out.';
  return 'Catalog sync failed. Check sanitized server logs for the request ID.';
}

function pushIssue(issues: ValidationIssue[], productId: string | undefined, reason: string) {
  issues.push({ productId: productId || 'unknown', reason });
}

function countDuplicates(values: string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    } else {
      seen.add(value);
    }
  }

  return duplicates.size;
}

function hasUsableImage(product: PrintifyProduct) {
  return (product.images ?? []).some((image) => hasValue(image?.src));
}

function enabledInStockVariants(product: PrintifyProduct) {
  return (product.variants ?? []).filter(
    (variant) =>
      variant.is_enabled !== false &&
      variant.is_available !== false &&
      typeof variant.price === 'number' &&
      variant.price > 0,
  );
}

async function buildPreflight(
  products: PrintifyProduct[],
  hideMissing: boolean,
): Promise<PreflightSummary> {
  const productIds = products.map((product) => String(product.id || ''));
  const variantIds = products.flatMap((product) =>
    (product.variants ?? []).map((variant) => String(variant.id)),
  );
  const duplicatePrintifyProductIdCount = countDuplicates(productIds.filter(Boolean));
  const duplicateVariantIdCount = countDuplicates(variantIds.filter(Boolean));
  const issues: ValidationIssue[] = [];

  let variantCount = 0;
  let enabledInStockVariantCount = 0;
  let imageCount = 0;
  let productsMissingUsableImages = 0;
  let productsMissingEnabledVariants = 0;
  let productsMissingValidPrices = 0;

  for (const product of products) {
    const productId = String(product.id || '');
    const images = product.images ?? [];
    const variants = product.variants ?? [];
    const sellableVariants = enabledInStockVariants(product);

    variantCount += variants.length;
    enabledInStockVariantCount += sellableVariants.length;
    imageCount += images.filter((image) => hasValue(image?.src)).length;

    if (!hasValue(productId)) pushIssue(issues, productId, 'missing_product_id');
    if (!hasValue(product.title)) pushIssue(issues, productId, 'missing_title');
    if (!hasUsableImage(product)) {
      productsMissingUsableImages += 1;
      pushIssue(issues, productId, 'missing_usable_image');
    }
    if (sellableVariants.length === 0) {
      productsMissingEnabledVariants += 1;
      pushIssue(issues, productId, 'missing_enabled_in_stock_variant');
    }
    if (
      variants.length > 0 &&
      !variants.some((variant) => typeof variant.price === 'number' && variant.price > 0)
    ) {
      productsMissingValidPrices += 1;
      pushIssue(issues, productId, 'missing_valid_variant_price');
    }
  }

  if (duplicatePrintifyProductIdCount > 0) {
    pushIssue(issues, 'catalog', 'duplicate_printify_product_ids');
  }
  if (duplicateVariantIdCount > 0) {
    pushIssue(issues, 'catalog', 'duplicate_printify_variant_ids');
  }

  const existingProducts = await db.product.findMany({
    where: { printifyProductId: { not: null } },
    select: { printifyProductId: true },
  });
  const existingIds = new Set(
    existingProducts
      .map((product) => product.printifyProductId)
      .filter((id): id is string => hasValue(id)),
  );
  const incomingIds = new Set(productIds.filter(Boolean));
  const wouldUpdate = productIds.filter((id) => existingIds.has(id)).length;
  const wouldInsert = productIds.filter((id) => hasValue(id) && !existingIds.has(id)).length;
  const wouldHide = hideMissing
    ? Array.from(existingIds).filter((id) => !incomingIds.has(id)).length
    : 0;
  const invalidProductCount = new Set(
    issues.map((issue) => issue.productId).filter((id) => id !== 'catalog'),
  ).size;
  const safeToApply =
    products.length > 0 &&
    issues.length === 0 &&
    duplicatePrintifyProductIdCount === 0 &&
    duplicateVariantIdCount === 0;

  return {
    productCount: products.length,
    variantCount,
    enabledInStockVariantCount,
    imageCount,
    invalidProductCount,
    productsMissingUsableImages,
    productsMissingEnabledVariants,
    productsMissingValidPrices,
    duplicatePrintifyProductIdCount,
    duplicateVariantIdCount,
    existingPrintifyProductCount: existingProducts.length,
    wouldInsert,
    wouldUpdate,
    wouldHide,
    wouldSkip: invalidProductCount,
    hideMissing,
    safeToApply,
    issues: issues.slice(0, 25),
  };
}

async function fetchCatalogForPreflight(requestId: string) {
  try {
    const service = getPrintifyService();
    const products: PrintifyProduct[] = [];
    let page = 1;
    let expectedTotal: number | null = null;
    let expectedLastPage: number | null = null;

    for (;;) {
      const result = await service.getProducts(page, 50);
      const pageProducts = Array.isArray(result.data) ? result.data : null;

      if (
        !pageProducts ||
        !Number.isFinite(result.total) ||
        !Number.isFinite(result.last_page) ||
        result.last_page < 1 ||
        result.current_page !== page
      ) {
        throw new Error('Printify pagination metadata invalid.');
      }

      if (expectedTotal === null) {
        expectedTotal = result.total;
        expectedLastPage = result.last_page;
      } else if (result.total !== expectedTotal || result.last_page !== expectedLastPage) {
        throw new Error('Printify pagination metadata changed during fetch.');
      }

      products.push(...pageProducts);

      if (page >= result.last_page) break;
      page += 1;
    }

    if (expectedTotal !== null && products.length !== expectedTotal) {
      throw new Error('Printify pagination incomplete.');
    }

    return products;
  } catch (error) {
    logger.error(
      'printify_catalog_fetch_failed',
      { requestId, route: ROUTE },
      { error: sanitizeError(error) },
    );
    throw error;
  }
}

async function runPreflight(requestId: string, hideMissing: boolean) {
  const products = await fetchCatalogForPreflight(requestId);
  const preflight = await buildPreflight(products, hideMissing);

  logger.info('printify_catalog_sync_preflight', {
    requestId,
    route: ROUTE,
    extra: {
      productCount: preflight.productCount,
      wouldInsert: preflight.wouldInsert,
      wouldUpdate: preflight.wouldUpdate,
      wouldHide: preflight.wouldHide,
      safeToApply: preflight.safeToApply,
    },
  });

  return { products, preflight };
}

async function handlePreflight(request: NextRequest) {
  const requestId = getRequestId(request);
  const authContext = await authorize(request, requestId);
  if (authContext instanceof Response) return authContext;

  const rateLimitFailure = await enforceDistributedRateLimit(authContext, 'preflight', requestId);
  if (rateLimitFailure) return rateLimitFailure;

  try {
    const { preflight } = await runPreflight(requestId, false);
    return json(
      { ok: preflight.safeToApply, requestId, data: { operation: 'preflight', preflight } },
      undefined,
      requestId,
    );
  } catch (error) {
    return json({ ok: false, error: sanitizeError(error), requestId }, { status: 502 }, requestId);
  }
}

export async function GET(request: NextRequest) {
  return handlePreflight(request);
}

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  const authContext = await authorize(request, requestId);
  if (authContext instanceof Response) return authContext;

  let body: CatalogSyncRequestBody;
  try {
    body = await parseBody(request);
  } catch (error) {
    return json({ ok: false, error: sanitizeError(error), requestId }, { status: 400 }, requestId);
  }

  const operation = normalizeOperation(body);

  if (operation === 'manual') {
    return json(
      {
        ok: false,
        error:
          'Manual event dispatch is not available on this protected endpoint. Use preflight or apply.',
        requestId,
      },
      { status: 400 },
      requestId,
    );
  }

  if (operation === 'preflight') {
    const rateLimitFailure = await enforceDistributedRateLimit(authContext, 'preflight', requestId);
    if (rateLimitFailure) return rateLimitFailure;

    try {
      const { preflight } = await runPreflight(requestId, false);
      return json(
        { ok: preflight.safeToApply, requestId, data: { operation, preflight } },
        undefined,
        requestId,
      );
    } catch (error) {
      return json(
        { ok: false, error: sanitizeError(error), requestId },
        { status: 502 },
        requestId,
      );
    }
  }

  if (operation !== 'apply') {
    return json(
      { ok: false, error: 'Invalid catalog sync operation.', requestId },
      { status: 400 },
      requestId,
    );
  }

  const rateLimitFailure = await enforceDistributedRateLimit(authContext, 'apply', requestId);
  if (rateLimitFailure) return rateLimitFailure;

  if (body.apply !== true) {
    return json(
      { ok: false, error: 'Catalog apply requires apply=true.', requestId },
      { status: 400 },
      requestId,
    );
  }

  if (body.hideMissing === true) {
    return json(
      {
        ok: false,
        error: 'hideMissing is disabled for the initial controlled import path.',
        requestId,
      },
      { status: 400 },
      requestId,
    );
  }

  const lease = await acquireApplyLock(requestId);
  if (lease.response) return lease.response;
  const ownerToken = lease.ownerToken;
  if (!ownerToken) {
    return json(
      { ok: false, error: 'Catalog sync lock unavailable.', requestId },
      { status: 503 },
      requestId,
    );
  }

  try {
    const { products, preflight } = await runPreflight(requestId, false);
    if (!preflight.safeToApply) {
      return json(
        {
          ok: false,
          error: 'Catalog preflight failed. Apply was not run.',
          requestId,
          data: { operation: 'apply', preflight },
        },
        { status: 422 },
        requestId,
      );
    }

    const result = await syncPrintifyProducts(products, { hideMissing: false });
    const sanitizedErrors = result.errors
      .slice(0, 25)
      .map(() => 'Product sync failed for one item. Check server logs by request ID.');

    logger.info('printify_catalog_sync_apply_completed', {
      requestId,
      route: ROUTE,
      userId: authContext.userId,
      extra: {
        authKind: authContext.kind,
        upserted: result.upserted,
        hidden: result.hidden,
        errorCount: result.errors.length,
      },
    });

    return json(
      {
        ok: result.errors.length === 0,
        requestId,
        data: {
          operation: 'apply',
          preflight,
          result: {
            productCount: result.count,
            upserted: result.upserted,
            hidden: result.hidden,
            errorCount: result.errors.length,
            errors: sanitizedErrors,
            lastSync: result.lastSync,
          },
        },
      },
      { status: result.errors.length === 0 ? 200 : 207 },
      requestId,
    );
  } catch (error) {
    logger.error(
      'printify_catalog_sync_apply_failed',
      { requestId, route: ROUTE, userId: authContext.userId },
      { error: sanitizeError(error) },
    );
    return json({ ok: false, error: sanitizeError(error), requestId }, { status: 500 }, requestId);
  } finally {
    await releaseApplyLock(ownerToken, requestId);
  }
}
