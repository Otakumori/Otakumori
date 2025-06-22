'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.rateLimit = rateLimit;
const redis_1 = require('@upstash/redis');
const server_1 = require('next/server');
const error_1 = require('@/lib/error');
const redis = new redis_1.Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});
const defaultConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per window
  keyPrefix: 'rate-limit:',
};
async function rateLimit(request, config = {}) {
  const { windowMs, max, keyPrefix } = { ...defaultConfig, ...config };
  const ip = request.ip ?? 'anonymous';
  const key = `${keyPrefix}${ip}`;
  try {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, windowMs / 1000);
    }
    if (current > max) {
      throw new error_1.RateLimitError();
    }
    return server_1.NextResponse.next();
  } catch (error) {
    if (error instanceof error_1.RateLimitError) {
      return new server_1.NextResponse(
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
    return server_1.NextResponse.next();
  }
}
