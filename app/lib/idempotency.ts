import { type NextRequest, NextResponse } from 'next/server';
import { db } from './db';
import { IdempotencyKeySchema } from './api-contracts';
import { createApiError, generateRequestId, API_ERROR_CODES } from './api-contracts';

interface IdempotencyRecord {
  id: string;
  key: string;
  method: string;
  path: string;
  userId?: string;
  response: any;
  createdAt: Date;
  expiresAt: Date;
}

// Idempotency key TTL: 24 hours
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

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

  // Validate idempotency key format
  const keyValidation = IdempotencyKeySchema.safeParse(idempotencyKey);
  if (!keyValidation.success) {
    const requestId = generateRequestId();
    return {
      isDuplicate: false,
      response: NextResponse.json(
        createApiError('IDEMPOTENCY_KEY_INVALID', 'Invalid idempotency key format', requestId),
        {
          status: 400,
          headers: { 'x-otm-reason': 'IDEMPOTENCY_KEY_INVALID' },
        },
      ),
    };
  }

  try {
    // Check for existing idempotency record
    const existingRecord = await db.idempotencyKey.findUnique({
      where: { key: idempotencyKey },
    });

    if (existingRecord) {
      // Check if record is still valid (not expired)
      if (existingRecord.expiresAt > new Date()) {
        // Return cached response
        const cachedResponse = JSON.parse(existingRecord.response);
        return {
          isDuplicate: true,
          response: NextResponse.json(cachedResponse, { status: 200 }),
        };
      } else {
        // Clean up expired record
        await db.idempotencyKey.delete({
          where: { key: idempotencyKey },
        });
      }
    }

    return { isDuplicate: false };
  } catch (error) {
    console.error('Idempotency check error:', error);
    // If idempotency check fails, allow the request to proceed
    // This prevents idempotency system from blocking legitimate requests
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
    const expiresAt = new Date(Date.now() + IDEMPOTENCY_TTL_MS);

    await db.idempotencyKey.create({
      data: {
        key: idempotencyKey,
        method,
        path,
        userId,
        response: JSON.stringify(response),
        expiresAt,
      },
    });
  } catch (error) {
    console.error('Failed to store idempotency response:', error);
    // Don't throw - this is not critical for the request
  }
}

// Cleanup expired idempotency keys (should be run periodically)
export async function cleanupExpiredIdempotencyKeys(): Promise<void> {
  try {
    await db.idempotencyKey.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  } catch (error) {
    console.error('Failed to cleanup expired idempotency keys:', error);
  }
}
