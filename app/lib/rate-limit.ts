/**
 * Rate limiting utilities for API endpoints
 */

import { getRedis } from './redis';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (request: Request) => string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

const RATE_LIMIT_PREFIX = 'rate_limit:';

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const redis = await getRedis();
  const windowKey = `${RATE_LIMIT_PREFIX}${key}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  try {
    // Get current count and remove expired entries
    const pipeline = redis.pipeline();
    pipeline.zremrangebyscore(windowKey, 0, windowStart);
    pipeline.zcard(windowKey);
    pipeline.expire(windowKey, Math.ceil(config.windowMs / 1000));

    const results = await pipeline.exec();
    const currentCount = (results?.[1]?.[1] as number) || 0;

    if (currentCount >= config.maxRequests) {
      // Get the oldest request time to calculate reset time
      const oldestRequest = await redis.zrange(windowKey, 0, 0, 'WITHSCORES');
      const resetTime =
        oldestRequest.length > 0
          ? parseInt(oldestRequest[1]) + config.windowMs
          : now + config.windowMs;

      return {
        allowed: false,
        remaining: 0,
        resetTime,
      };
    }

    // Add current request
    await redis.zadd(windowKey, now, `${now}-${Math.random()}`);

    return {
      allowed: true,
      remaining: config.maxRequests - currentCount - 1,
      resetTime: now + config.windowMs,
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open - allow request if Redis is down
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetTime: now + config.windowMs,
    };
  }
}

export function createRateLimitMiddleware(config: RateLimitConfig) {
  return async (request: Request): Promise<Response | null> => {
    const key = config.keyGenerator ? config.keyGenerator(request) : new URL(request.url).pathname;

    const result = await checkRateLimit(key, config);

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Rate limit exceeded',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          },
        },
      );
    }

    return null; // Allow request to proceed
  };
}

// Common rate limit configurations
export const RATE_LIMITS = {
  AVATAR_SAVE: {
    windowMs: 10 * 1000, // 10 seconds
    maxRequests: 5,
  },
  AVATAR_LOAD: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
  },
  GENERAL_API: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },
} as const;
