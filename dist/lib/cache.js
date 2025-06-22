'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.Cache = exports.cache = void 0;
const redis_1 = require('@upstash/redis');
const redis = new redis_1.Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});
exports.cache = {
  async get(key) {
    try {
      return await redis.get(key);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },
  async set(key, value, options) {
    try {
      if (options?.ttl) {
        await redis.set(key, value, { ex: options.ttl });
      } else {
        await redis.set(key, value);
      }
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },
  async del(key) {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  },
  async clear() {
    try {
      await redis.flushdb();
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  },
};
class Cache {
  static instance;
  redis;
  constructor() {
    this.redis = redis;
  }
  static getInstance() {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }
  async invalidateByTags(tags) {
    try {
      const keys = await Promise.all(tags.map(tag => this.redis.smembers(`tag:${tag}`)));
      const uniqueKeys = [...new Set(keys.flat())];
      if (uniqueKeys.length) {
        await this.redis.del(...uniqueKeys);
      }
      await Promise.all(tags.map(tag => this.redis.del(`tag:${tag}`)));
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }
}
exports.Cache = Cache;
