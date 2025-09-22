import { redis } from '@/lib/redis';
import { type NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyPrefix: string; // Redis key prefix
  blockDuration?: number; // Optional block duration after limit exceeded
}

const memoryStore = new Map<string, { count: number; resetTime: number }>();

export async function rateLimit(
  req: NextRequest,
  config: RateLimitConfig,
  identifier?: string,
): Promise<{ limited: boolean; remaining: number; resetTime: number }> {
  const key = identifier || req.headers.get('x-forwarded-for') || 'anonymous';
  const now = Date.now();
  const windowKey = `${config.keyPrefix}:${key}`;

  if (redis) {
    // Redis-based rate limiting
    try {
      const current = await redis.get<number>(windowKey);
      if (current && current >= config.maxRequests) {
        return { limited: true, remaining: 0, resetTime: now + config.windowMs };
      }

      const multi = redis.pipeline();
      multi.incr(windowKey);
      multi.expire(windowKey, Math.ceil(config.windowMs / 1000));
      const results = await multi.exec();
      const count = results[0] as number;

      return {
        limited: false,
        remaining: Math.max(0, config.maxRequests - count),
        resetTime: now + config.windowMs,
      };
    } catch (error) {
      console.warn('Redis rate limit failed, falling back to memory:', error);
    }
  }

  // In-memory fallback
  const current = memoryStore.get(windowKey);
  if (current && now < current.resetTime) {
    if (current.count >= config.maxRequests) {
      return { limited: true, remaining: 0, resetTime: current.resetTime };
    }
    current.count++;
    return {
      limited: false,
      remaining: Math.max(0, config.maxRequests - current.count),
      resetTime: current.resetTime,
    };
  }

  // New window
  const resetTime = now + config.windowMs;
  memoryStore.set(windowKey, { count: 1, resetTime });

  // Cleanup old entries
  for (const [k, v] of memoryStore.entries()) {
    if (now > v.resetTime) memoryStore.delete(k);
  }

  return {
    limited: false,
    remaining: config.maxRequests - 1,
    resetTime,
  };
}

export function createRateLimitMiddleware(config: RateLimitConfig) {
  return async function rateLimitMiddleware(req: NextRequest) {
    const result = await rateLimit(req, config);

    if (result.limited) {
      return NextResponse.json(
        { ok: false, error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': Math.ceil(config.windowMs / 1000).toString(),
          },
        },
      );
    }

    return null; // Continue to next middleware/handler
  };
}
