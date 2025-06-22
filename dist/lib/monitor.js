'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.monitor = exports.SystemMonitor = void 0;
const redis_1 = require('@upstash/redis');
const logger_1 = require('./logger');
const cache_1 = require('./cache');
const supabase_js_1 = require('@supabase/supabase-js');
const redis = new redis_1.Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});
const supabase = (0, supabase_js_1.createClient)(
  env.POSTGRES_SUPABASE_URL,
  env.POSTGRES_SUPABASE_SERVICE_ROLE_KEY
);
class SystemMonitor {
  metrics = [];
  MAX_METRICS = 1000;
  metricsKey = 'system:metrics';
  requestCountKey = 'system:requests';
  errorCountKey = 'system:errors';
  responseTimeKey = 'system:response_times';
  frontendMetricsKey = 'system:frontend_metrics';
  gameMetricsKey = 'system:game_metrics';
  animationMetricsKey = 'system:animation_metrics';
  async getActiveUsers() {
    try {
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('last_active', new Date(Date.now() - 5 * 60 * 1000).toISOString());
      return count || 0;
    } catch (error) {
      logger_1.logger.error('Error getting active users:', error);
      return 0;
    }
  }
  async getRequestsPerMinute() {
    try {
      const now = Date.now();
      const oneMinuteAgo = now - 60 * 1000;
      const requests = await redis.zrangebyscore(this.requestCountKey, oneMinuteAgo, now);
      return requests.length;
    } catch (error) {
      logger_1.logger.error('Error getting requests per minute:', error);
      return 0;
    }
  }
  async getErrorRate() {
    try {
      const now = Date.now();
      const oneMinuteAgo = now - 60 * 1000;
      const totalRequests = await redis.zrangebyscore(this.requestCountKey, oneMinuteAgo, now)
        .length;
      const errors = await redis.zrangebyscore(this.errorCountKey, oneMinuteAgo, now).length;
      return totalRequests > 0 ? (errors / totalRequests) * 100 : 0;
    } catch (error) {
      logger_1.logger.error('Error getting error rate:', error);
      return 0;
    }
  }
  async getAverageResponseTime() {
    try {
      const now = Date.now();
      const oneMinuteAgo = now - 60 * 1000;
      const responseTimes = await redis.zrangebyscore(this.responseTimeKey, oneMinuteAgo, now);
      if (responseTimes.length === 0) return 0;
      const sum = responseTimes.reduce((a, b) => a + Number(b), 0);
      return sum / responseTimes.length;
    } catch (error) {
      logger_1.logger.error('Error getting average response time:', error);
      return 0;
    }
  }
  async getDatabaseConnections() {
    try {
      const { data, error } = await supabase.rpc('get_db_connections');
      if (error) throw error;
      return data || 0;
    } catch (error) {
      logger_1.logger.error('Error getting database connections:', error);
      return 0;
    }
  }
  async getCacheHitRate() {
    try {
      const hits = Number(await cache_1.cache.get('cache:hits')) || 0;
      const misses = Number(await cache_1.cache.get('cache:misses')) || 0;
      const total = hits + misses;
      return total > 0 ? (hits / total) * 100 : 0;
    } catch (error) {
      logger_1.logger.error('Error getting cache hit rate:', error);
      return 0;
    }
  }
  async getCacheSize() {
    try {
      return Number(await cache_1.cache.get('cache:size')) || 0;
    } catch (error) {
      logger_1.logger.error('Error getting cache size:', error);
      return 0;
    }
  }
  async collectMetrics() {
    try {
      const startTime = Date.now();
      const metrics = {
        timestamp: Date.now(),
        cpu: process.cpuUsage().user / 1000000, // Convert to percentage
        memory: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100,
        activeUsers: await this.getActiveUsers(),
        requestsPerMinute: await this.getRequestsPerMinute(),
        errorRate: await this.getErrorRate(),
        avgResponseTime: await this.getAverageResponseTime(),
        dbConnections: await this.getDatabaseConnections(),
        cacheHitRate: await this.getCacheHitRate(),
        cacheSize: await this.getCacheSize(),
      };
      this.metrics.push(metrics);
      if (this.metrics.length > this.MAX_METRICS) {
        this.metrics.shift();
      }
      // Store metrics in Redis with timestamp as score
      await redis.zadd(this.metricsKey, {
        score: metrics.timestamp,
        member: JSON.stringify(metrics),
      });
      // Keep only last 24 hours of metrics
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      await redis.zremrangebyscore(this.metricsKey, 0, oneDayAgo);
      logger_1.logger.info('Metrics collected', { metrics });
      return metrics;
    } catch (error) {
      logger_1.logger.error('Failed to collect metrics:', error);
      throw error;
    }
  }
  async getMetricsHistory(hours = 24) {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.metrics.filter(m => new Date(m.timestamp) > cutoff);
  }
  async recordRequest(responseTime) {
    try {
      const now = Date.now();
      await redis.zadd(this.requestCountKey, {
        score: now,
        member: now.toString(),
      });
      await redis.zadd(this.responseTimeKey, {
        score: now,
        member: responseTime.toString(),
      });
      // Clean up old data
      const oneMinuteAgo = now - 60 * 1000;
      await redis.zremrangebyscore(this.requestCountKey, 0, oneMinuteAgo);
      await redis.zremrangebyscore(this.responseTimeKey, 0, oneMinuteAgo);
    } catch (error) {
      logger_1.logger.error('Error recording request:', error);
    }
  }
  async recordError() {
    try {
      const now = Date.now();
      await redis.zadd(this.errorCountKey, {
        score: now,
        member: now.toString(),
      });
      // Clean up old data
      const oneMinuteAgo = now - 60 * 1000;
      await redis.zremrangebyscore(this.errorCountKey, 0, oneMinuteAgo);
    } catch (error) {
      logger_1.logger.error('Error recording error:', error);
    }
  }
  async checkHealth() {
    try {
      const startTime = Date.now();
      const metrics = await this.collectMetrics();
      const responseTime = Date.now() - startTime;
      // Check database connection
      const { data: dbStatus, error: dbError } = await supabase
        .from('users')
        .select('count(*)', { count: 'exact', head: true });
      // Check cache
      const cacheKey = 'health_check';
      await cache_1.cache.set(cacheKey, { timestamp: new Date().toISOString() }, { ttl: 60 });
      const cacheStatus = await cache_1.cache.get(cacheKey);
      // Determine overall health status
      const isHealthy = !dbError && cacheStatus !== null;
      const status = isHealthy ? 'healthy' : 'error';
      const message = isHealthy
        ? 'All systems operational'
        : 'Some services are experiencing issues';
      return {
        status,
        message,
        lastChecked: new Date().toISOString(),
        metrics,
        services: {
          database: {
            status: dbError ? 'error' : 'healthy',
            error: dbError?.message,
          },
          cache: {
            status: cacheStatus !== null ? 'healthy' : 'error',
          },
        },
      };
    } catch (error) {
      logger_1.logger.error('Health check failed:', error);
      return {
        status: 'error',
        message: 'Health check failed',
        lastChecked: new Date().toISOString(),
        metrics: {
          timestamp: Date.now(),
          cpu: 0,
          memory: 0,
          activeUsers: 0,
          requestsPerMinute: 0,
          errorRate: 0,
          avgResponseTime: 0,
          dbConnections: 0,
          cacheHitRate: 0,
          cacheSize: 0,
        },
        services: {
          database: {
            status: 'error',
            error: error instanceof Error ? error.message : String(error),
          },
          cache: {
            status: 'error',
          },
        },
      };
    }
  }
}
exports.SystemMonitor = SystemMonitor;
exports.monitor = new SystemMonitor();
