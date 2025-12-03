/**
 * Idempotency utilities for API endpoints
 */

import { logger } from '@/app/lib/logger';
import { getRedis } from './redis';
import { generateRequestId } from './request-id';

export interface IdempotencyResult<T = any> {
  isNew: boolean;
  response?: T;
  requestId: string;
}

const IDEMPOTENCY_PREFIX = 'idempotency:';
const IDEMPOTENCY_TTL = 24 * 60 * 60; // 24 hours in seconds

export async function checkIdempotency<T = any>(key: string): Promise<IdempotencyResult<T>> {
  const redis = await getRedis();
  const idempotencyKey = `${IDEMPOTENCY_PREFIX}${key}`;

  try {
    const cachedResponse = await redis.get(idempotencyKey);

    if (cachedResponse) {
      const parsedResponse = JSON.parse(cachedResponse);
      return {
        isNew: false,
        response: parsedResponse,
        requestId: generateRequestId(),
      };
    }

    return {
      isNew: true,
      requestId: generateRequestId(),
    };
  } catch (error) {
    logger.error('Idempotency check failed:', error);
    // Fail open - treat as new request if Redis is down
    return {
      isNew: true,
      requestId: generateRequestId(),
    };
  }
}

export async function storeIdempotencyResponse<T = any>(key: string, response: T): Promise<void> {
  const redis = await getRedis();
  const idempotencyKey = `${IDEMPOTENCY_PREFIX}${key}`;

  try {
    await redis.setex(idempotencyKey, IDEMPOTENCY_TTL, JSON.stringify(response));
  } catch (error) {
    logger.error('Failed to store idempotency response:', error);
    // Don't throw - this is not critical
  }
}

export function createIdempotencyMiddleware() {
  return async (
    request: Request,
  ): Promise<{
    key: string;
    result: IdempotencyResult;
  }> => {
    const idempotencyKey = request.headers.get('x-idempotency-key');

    if (!idempotencyKey) {
      throw new Error('x-idempotency-key header is required');
    }

    const result = await checkIdempotency(idempotencyKey);

    return {
      key: idempotencyKey,
      result,
    };
  };
}

export function getIdempotencyKeyFromRequest(request: Request): string {
  const idempotencyKey = request.headers.get('x-idempotency-key');

  if (!idempotencyKey) {
    throw new Error('x-idempotency-key header is required');
  }

  return idempotencyKey;
}
