import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RateLimitError } from '@/lib/error';

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL!,
  token: env.UPSTASH_REDIS_REST_TOKEN!,
});

interface RateLimitConfig {
  windowMs: number;
  max: number;
  keyPrefix: string;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per window
  keyPrefix: 'rate-limit:',
};

export async function rateLimit(request: NextRequest, config: Partial<RateLimitConfig> = {}) {
  const { windowMs, max, keyPrefix } = { ...defaultConfig, ...config };
  const ip = request.ip ?? 'anonymous';
  const key = `${keyPrefix}${ip}`;

  try {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, windowMs / 1000);
    }

    if (current > max) {
      throw new RateLimitError();
    }

    return NextResponse.next();
  } catch (error) {
    if (error instanceof RateLimitError) {
      return new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil(windowMs / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(windowMs / 1000).toString(),
          },
        }
      );
    }

    console.error('Rate limit error:', error);
    return NextResponse.next();
  }
}
