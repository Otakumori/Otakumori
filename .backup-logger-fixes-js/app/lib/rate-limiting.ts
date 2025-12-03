import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';
import { type NextRequest } from 'next/server';
import { redis } from './redis';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

// Import rate limits from api-contracts for consistency
import { RATE_LIMITS } from './api-contracts';

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  message?: string;
}

export async function checkRateLimit(
  key: string,
  identifier: string,
  config?: RateLimitConfig,
): Promise<RateLimitResult> {
  const rateLimitConfig = config || RATE_LIMITS[key] || RATE_LIMITS['DEFAULT'];
  const window = Math.floor(Date.now() / rateLimitConfig.windowMs);
  const redisKey = `rate_limit:${key}:${identifier}:${window}`;

  try {
    const current = await redis.incr(redisKey);

    if (current === 1) {
      // Set expiration for the first request in this window
      await redis.expire(redisKey, Math.ceil(rateLimitConfig.windowMs / 1000));
    }

    const remaining = Math.max(0, rateLimitConfig.maxRequests - current);
    const resetTime = (window + 1) * rateLimitConfig.windowMs;

    return {
      success: current <= rateLimitConfig.maxRequests,
      limit: rateLimitConfig.maxRequests,
      remaining,
      resetTime,
      message: current > rateLimitConfig.maxRequests ? rateLimitConfig.message : undefined,
    };
  } catch (error) {
    logger.error('Rate limiting error:', error);
    // On Redis error, allow the request to proceed
    return {
      success: true,
      limit: rateLimitConfig.maxRequests,
      remaining: rateLimitConfig.maxRequests,
      resetTime: Date.now() + rateLimitConfig.windowMs,
    };
  }
}

export function getClientIdentifier(req: NextRequest, userId?: string): string {
  // Prefer userId for authenticated requests
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
  return `ip:${ip}`;
}

// Higher-order function to wrap route handlers with rate limiting
export function withRateLimit<T extends any[]>(
  limitKey: string,
  handler: (req: NextRequest, ...args: T) => Promise<Response>,
) {
  return async (req: NextRequest, ...args: T): Promise<Response> => {
    try {
      // Extract user ID from Clerk session token
      const authHeader = req.headers.get('authorization');
      const sessionCookie = req.cookies.get('__session')?.value;
      let userId: string | undefined;

      // Extract user ID from Bearer token or session cookie
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');
        // Decode JWT payload (without verification for rate limiting purposes)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          userId = payload.sub || payload.userId;
          logger.warn('Rate limiting with authenticated user', { userId, role: payload.role });
        } catch {
          // Invalid JWT format, fall back to IP
        }
      } else if (sessionCookie) {
        // Try to extract from Clerk session cookie
        try {
          const sessionData = JSON.parse(atob(sessionCookie.split('.')[1]));
          userId = sessionData.sub || sessionData.userId;
        } catch {
          // Invalid session format, fall back to IP
        }
      }

      const identifier = getClientIdentifier(req, userId);
      const rateLimitResult = await checkRateLimit(limitKey, identifier);

      // Add rate limit headers
      const headers = new Headers();
      headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
      headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
      headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());

      if (!rateLimitResult.success) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: rateLimitResult.message || 'Rate limit exceeded',
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              ...Object.fromEntries(headers.entries()),
            },
          },
        );
      }

      // Call the original handler
      const response = await handler(req, ...args);

      // Add rate limit headers to successful responses
      headers.forEach((value, key) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error) {
      logger.error('Rate limiting wrapper error:', error);
      // On error, proceed without rate limiting
      return handler(req, ...args);
    }
  };
}

// Utility to clear rate limit for a specific user/IP (admin function)
export async function clearRateLimit(key: string, identifier: string): Promise<void> {
  const pattern = `rate_limit:${key}:${identifier}:*`;
  try {
    // In production, you might want to use redis.keys(pattern) or redis.scan()
    // to clear all matching keys, but for now we'll clear the current window
    const window = Math.floor(Date.now() / (RATE_LIMITS[key]?.windowMs || 60000));
    const redisKey = `rate_limit:${key}:${identifier}:${window}`;
    await redis.del(redisKey);
    // Successfully cleared rate limit for pattern
    if (pattern) {
      // Pattern tracking for admin dashboard
    }
  } catch (error) {
    logger.error('Error clearing rate limit:', error);
  }
}
