import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';

import { createApiError, createApiSuccess, generateRequestId } from '@/app/lib/api-contracts';
import { withAdminAuth } from '@/app/lib/auth/admin';
import {
  applyMerchizeHiddenLocalImport,
  assertMerchizeLocalImportEnabled,
  MERCHIZE_IMPORT_CONFIRMATION,
  type MerchizeImportApplyInput,
} from '@/app/lib/merchize/importApply';
import { limitApi } from '@/lib/ratelimit';

export const runtime = 'nodejs';

type ApplyBody = {
  confirmation?: unknown;
  manifestVersion?: unknown;
  preflightFingerprint?: unknown;
  fingerprintExpiresAt?: unknown;
  preflightSignature?: unknown;
  idempotencyKey?: unknown;
  expectedProductCount?: unknown;
  expectedInsertCount?: unknown;
  expectedUpdateCount?: unknown;
  expectedSkipCount?: unknown;
  expectedBlockCount?: unknown;
};

const MIN_IDEMPOTENCY_KEY_LENGTH = 16;
const MAX_IDEMPOTENCY_KEY_LENGTH = 200;

async function readApplyBody(request: NextRequest): Promise<ApplyBody> {
  const text = await request.text();
  if (!text.trim()) return {};

  const parsed = JSON.parse(text);
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
    ? (parsed as ApplyBody)
    : {};
}

function stringField(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function rawStringField(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function numberField(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0) return value;
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) return Number(value.trim());
  return null;
}

function isValidIdempotencyKey(value: string): boolean {
  return (
    value.length >= MIN_IDEMPOTENCY_KEY_LENGTH &&
    value.length <= MAX_IDEMPOTENCY_KEY_LENGTH &&
    value.trim() === value &&
    /^[A-Za-z0-9._~:/#@+=-]+$/.test(value)
  );
}

function applyInputFromBody(
  body: ApplyBody,
  request: NextRequest,
): Omit<MerchizeImportApplyInput, 'requestId' | 'adminUserId'> | null {
  const idempotencyKey =
    request.headers.get('x-idempotency-key') || rawStringField(body.idempotencyKey);
  const confirmation = stringField(body.confirmation);
  const manifestVersion = stringField(body.manifestVersion);
  const preflightFingerprint = stringField(body.preflightFingerprint);
  const fingerprintExpiresAt = stringField(body.fingerprintExpiresAt);
  const preflightSignature = stringField(body.preflightSignature);
  const expectedProductCount = numberField(body.expectedProductCount);
  const expectedInsertCount = numberField(body.expectedInsertCount);
  const expectedUpdateCount = numberField(body.expectedUpdateCount);
  const expectedSkipCount = numberField(body.expectedSkipCount);
  const expectedBlockCount = numberField(body.expectedBlockCount);

  if (
    !idempotencyKey ||
    !isValidIdempotencyKey(idempotencyKey) ||
    !confirmation ||
    !manifestVersion ||
    !preflightFingerprint ||
    !fingerprintExpiresAt ||
    !preflightSignature ||
    expectedProductCount == null ||
    expectedInsertCount == null ||
    expectedUpdateCount == null ||
    expectedSkipCount == null ||
    expectedBlockCount == null
  ) {
    return null;
  }

  return {
    idempotencyKey,
    confirmation,
    manifestVersion,
    preflightFingerprint,
    fingerprintExpiresAt,
    preflightSignature,
    expectedCounts: {
      productCount: expectedProductCount,
      wouldInsert: expectedInsertCount,
      wouldUpdate: expectedUpdateCount,
      wouldSkip: expectedSkipCount,
      wouldBlock: expectedBlockCount,
    },
  };
}

export const POST = withAdminAuth(async (request: NextRequest) => {
  const requestId = generateRequestId();
  const authResult = await auth();
  const adminUserId = authResult.userId;

  if (!adminUserId) {
    return NextResponse.json(
      createApiError('AUTH_REQUIRED', 'Authentication required.', requestId),
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    assertMerchizeLocalImportEnabled();
  } catch {
    return NextResponse.json(
      createApiError('FORBIDDEN', 'Hidden local Merchize import is disabled.', requestId),
      { status: 403, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const rateLimit = await limitApi(`admin:merchize:import-apply:${adminUserId}`);
  if (!rateLimit.success) {
    return NextResponse.json(
      createApiError('RATE_LIMITED', 'Too many Merchize import apply requests.', requestId),
      {
        status: 429,
        headers: {
          'Cache-Control': 'no-store',
          'Retry-After': String(Math.max(1, Math.ceil((rateLimit.reset - Date.now()) / 1000))),
        },
      },
    );
  }

  let body: ApplyBody;
  try {
    body = await readApplyBody(request);
  } catch {
    return NextResponse.json(
      createApiError('VALIDATION_ERROR', 'Invalid JSON request body.', requestId),
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const applyInput = applyInputFromBody(body, request);
  if (!applyInput) {
    return NextResponse.json(
      createApiError(
        'VALIDATION_ERROR',
        `Merchize hidden import requires idempotencyKey, confirmation "${MERCHIZE_IMPORT_CONFIRMATION}", manifest version, preflight fingerprint, expiry, signature, and expected counts.`,
        requestId,
      ),
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const result = await applyMerchizeHiddenLocalImport({
      requestId,
      adminUserId,
      ...applyInput,
    });
    const status = result.ok
      ? 200
      : result.replayed
        ? 409
        : result.status === 'blocked'
          ? 422
          : 500;

    return NextResponse.json(createApiSuccess(result, requestId), {
      status,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json(
      createApiError(
        'INTERNAL_ERROR',
        'Merchize hidden import failed. Check sanitized logs with the request ID.',
        requestId,
      ),
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
});
