import { NextRequest, NextResponse } from 'next/server';
import { redis } from './redis';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Skip rate limiting for successful requests
  skipFailedRequests?: boolean; // Skip rate limiting for failed requests
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

class RateLimiter {
  private memoryStore = new Map<string, { count: number; resetTime: number }>();

  async checkLimit(req: NextRequest, config: RateLimitConfig): Promise<RateLimitResult> {
    const key = config.keyGenerator ? config.keyGenerator(req) : this.generateKey(req);
    const now = Date.now();
    const windowStart = now - (now % config.windowMs);

    try {
      if (redis) {
        return await this.checkRedisLimit(key, config, windowStart);
      } else {
        return this.checkMemoryLimit(key, config, windowStart);
      }
    } catch (error) {
      console.error('Rate limiting error, falling back to memory store:', error);
      return this.checkMemoryLimit(key, config, windowStart);
    }
  }

  private async checkRedisLimit(
    key: string,
    config: RateLimitConfig,
    windowStart: number,
  ): Promise<RateLimitResult> {
    if (!redis) {
      throw new Error('Redis not available');
    }

    const redisKey = `rate_limit:${key}:${windowStart}`;

    try {
      const [count, ttl] = await Promise.all([redis.get(redisKey), redis.ttl(redisKey)]);

      const currentCount = parseInt(count as string) || 0;
      const remaining = Math.max(0, config.maxRequests - currentCount);
      const reset = windowStart + config.windowMs;

      if (currentCount >= config.maxRequests) {
        return {
          success: false,
          limit: config.maxRequests,
          remaining: 0,
          reset,
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        };
      }

      // Increment counter
      await redis
        .multi()
        .incr(redisKey)
        .expire(redisKey, Math.ceil(config.windowMs / 1000))
        .exec();

      return {
        success: true,
        limit: config.maxRequests,
        remaining: remaining - 1,
        reset,
      };
    } catch (error) {
      console.error('Redis rate limiting error:', error);
      throw error;
    }
  }

  private checkMemoryLimit(
    key: string,
    config: RateLimitConfig,
    windowStart: number,
  ): RateLimitResult {
    const storeKey = `${key}:${windowStart}`;
    const current = this.memoryStore.get(storeKey);

    if (!current || current.resetTime < Date.now()) {
      // New window or expired
      this.memoryStore.set(storeKey, {
        count: 1,
        resetTime: windowStart + config.windowMs,
      });

      return {
        success: true,
        limit: config.maxRequests,
        remaining: config.maxRequests - 1,
        reset: windowStart + config.windowMs,
      };
    }

    if (current.count >= config.maxRequests) {
      return {
        success: false,
        limit: config.maxRequests,
        remaining: 0,
        reset: current.resetTime,
        retryAfter: Math.ceil((current.resetTime - Date.now()) / 1000),
      };
    }

    // Increment counter
    current.count++;
    this.memoryStore.set(storeKey, current);

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - current.count,
      reset: current.resetTime,
    };
  }

  private generateKey(req: NextRequest): string {
    // Use IP address as default key
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Create a hash-like key from IP and user agent
    return `${ip}:${userAgent}`.replace(/[^a-zA-Z0-9:]/g, '');
  }

  // Clean up expired entries from memory store
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.memoryStore.entries()) {
      if (value.resetTime < now) {
        this.memoryStore.delete(key);
      }
    }
  }
}

// Create singleton instance
const rateLimiter = new RateLimiter();

// Clean up expired entries every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);
}

export { rateLimiter };

// Middleware function for easy use in API routes
export async function withRateLimit(
  req: NextRequest,
  config: RateLimitConfig,
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  const result = await rateLimiter.checkLimit(req, config);

  if (!result.success) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Too many requests',
        retryAfter: result.retryAfter,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.toString(),
          'Retry-After': result.retryAfter?.toString() || '60',
        },
      },
    );
  }

  // Add rate limit headers to response
  const response = await handler();

  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.reset.toString());

  return response;
}

// Predefined rate limit configurations
export const rateLimitConfigs = {
  // Strict rate limiting for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
  },

  // Moderate rate limiting for public API endpoints
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  },

  // Loose rate limiting for general endpoints
  general: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  },

  // Very loose rate limiting for static content
  static: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 1000, // 1000 requests per minute
  },
} as const;
