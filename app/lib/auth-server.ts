import { auth } from '@clerk/nextjs/server';
import { type NextRequest } from 'next/server';

export interface AuthResult {
  isAuthenticated: boolean;
  userId?: string;
  user?: any;
  role?: string;
  error?: string;
}

export async function requireAuth(): Promise<AuthResult> {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return {
        isAuthenticated: false,
        error: 'Authentication required',
      };
    }

    const role = (sessionClaims as any)?.public_metadata?.role || 'user';

    return {
      isAuthenticated: true,
      userId,
      role,
    };
  } catch (error) {
    console.error('Auth error:', error);
    return {
      isAuthenticated: false,
      error: 'Authentication failed',
    };
  }
}

export async function requireRole(requiredRole: string): Promise<AuthResult> {
  const authResult = await requireAuth();

  if (!authResult.isAuthenticated) {
    return authResult;
  }

  const userRole = authResult.role || 'user';

  if (userRole !== requiredRole && userRole !== 'admin') {
    return {
      isAuthenticated: false,
      error: `Insufficient permissions. Required: ${requiredRole}`,
    };
  }

  return authResult;
}

export function createAuthResponse(error: string, status: number = 401) {
  return new Response(
    JSON.stringify({
      ok: false,
      error,
      code: status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'x-otm-reason': error,
      },
    },
  );
}

export function createSuccessResponse<T>(data: T) {
  return new Response(
    JSON.stringify({
      ok: true,
      data,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

export function createErrorResponse(error: string, status: number = 400) {
  return new Response(
    JSON.stringify({
      ok: false,
      error,
      code: status === 400 ? 'BAD_REQUEST' : 'INTERNAL_ERROR',
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'x-otm-reason': error,
      },
    },
  );
}

// Rate limiting utilities
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000,
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = identifier;
  const current = rateLimitMap.get(key);

  if (!current || now > current.resetTime) {
    // Reset or create new window
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: limit - 1,
      resetTime: now + windowMs,
    };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
    };
  }

  current.count++;
  return {
    allowed: true,
    remaining: limit - current.count,
    resetTime: current.resetTime,
  };
}

// Idempotency key validation
const idempotencyKeys = new Map<string, { result: any; expires: number }>();

export function checkIdempotency(key: string): { exists: boolean; result?: any } {
  const now = Date.now();
  const stored = idempotencyKeys.get(key);

  if (!stored || now > stored.expires) {
    return { exists: false };
  }

  return { exists: true, result: stored.result };
}

export function storeIdempotency(key: string, result: any, ttlMs: number = 300000) {
  idempotencyKeys.set(key, {
    result,
    expires: Date.now() + ttlMs,
  });
}

// Request ID generation
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// Extract request ID from headers
export function getRequestId(request: NextRequest): string {
  return (
    request.headers.get('x-request-id') ||
    request.headers.get('x-correlation-id') ||
    generateRequestId()
  );
}
