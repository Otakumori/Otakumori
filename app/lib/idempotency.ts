import { env } from '@/env.mjs';
import { redis } from './redis-rest';
import { type NextRequest, NextResponse } from 'next/server';
import { createApiError, generateRequestId } from './api-contracts';

export async function claimIdempotency(
  key: string,
  ttl: number = Number(env.IDEMPOTENCY_TTL_SECONDS),
) {
  const res = await redis.set(`idemp:${key}`, '1', { nx: true, ex: ttl });
  return res === 'OK';
}

export async function checkIdempotency(
  req: NextRequest,
  userId?: string,
): Promise<{ isDuplicate: boolean; response?: NextResponse }> {
  const idempotencyKey = req.headers.get('idempotency-key');

  if (!idempotencyKey) {
    const requestId = generateRequestId();
    return {
      isDuplicate: false,
      response: NextResponse.json(
        createApiError(
          'IDEMPOTENCY_KEY_REQUIRED',
          'Idempotency-Key header is required for this operation',
          requestId,
        ),
        {
          status: 400,
          headers: { 'x-otm-reason': 'IDEMPOTENCY_KEY_REQUIRED' },
        },
      ),
    };
  }

  try {
    // Check if key already exists in Redis
    const existing = await redis.get(`idemp:${idempotencyKey}`);
    if (existing) {
      // Return cached response (for now, just indicate duplicate)
      return {
        isDuplicate: true,
        response: NextResponse.json(
          { ok: false, error: 'Request already processed' },
          { status: 409 },
        ),
      };
    }

    // Claim the key for this request
    const claimed = await claimIdempotency(idempotencyKey);
    if (!claimed) {
      return {
        isDuplicate: true,
        response: NextResponse.json(
          { ok: false, error: 'Request already processed' },
          { status: 409 },
        ),
      };
    }

    return { isDuplicate: false };
  } catch (error) {
    console.error('Idempotency check error:', error);
    // If idempotency check fails, allow the request to proceed
    return { isDuplicate: false };
  }
}

export async function storeIdempotencyResponse(
  idempotencyKey: string,
  method: string,
  path: string,
  userId: string | undefined,
  response: any,
): Promise<void> {
  try {
    // Store the response in Redis with the same TTL
    await redis.set(`idemp:response:${idempotencyKey}`, JSON.stringify(response), {
      ex: Number(env.IDEMPOTENCY_TTL_SECONDS),
    });
  } catch (error) {
    console.error('Failed to store idempotency response:', error);
    // Don't throw - this is not critical for the request
  }
}
