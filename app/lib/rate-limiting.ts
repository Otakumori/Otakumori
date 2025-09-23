import { type NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import { env } from '../../env.mjs';

// Initialize Redis client
const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

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
    console.error('Rate limiting error:', error);
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
      // Extract user ID from request if available (simplified)
      const authHeader = req.headers.get('authorization');
      let userId: string | undefined;

      // Note: This is a simplified user extraction
      // In practice, you'd use your auth system to get the user ID

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
      console.error('Rate limiting wrapper error:', error);
      // On error, proceed without rate limiting
      return handler(req, ...args);
    }
  };
}

// Utility to clear rate limit for a specific user/IP (admin function)
export async function clearRateLimit(key: string, identifier: string): Promise<void> {
  const pattern = `rate_limit:${key}:${identifier}:*`;
  try {
    // Note: This is a simplified version. In production, you might want
    // to use a more efficient method to clear keys matching a pattern
    const window = Math.floor(Date.now() / (RATE_LIMITS[key]?.windowMs || 60000));
    const redisKey = `rate_limit:${key}:${identifier}:${window}`;
    await redis.del(redisKey);
  } catch (error) {
    console.error('Error clearing rate limit:', error);
  }
}
