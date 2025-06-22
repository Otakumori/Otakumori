'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.redis = void 0;
const redis_1 = require('@upstash/redis');
if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Missing Redis environment variables');
}
exports.redis = new redis_1.Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});
