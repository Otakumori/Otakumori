import { Redis } from '@upstash/redis';
import { logger } from './logger';
import { cache } from './cache';
import { createClient } from '@supabase/supabase-js';
import { performance } from 'perf_hooks';

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL!,
  token: env.UPSTASH_REDIS_REST_TOKEN!,
});

const supabase = createClient(
  env.POSTGRES_SUPABASE_URL!,
  env.POSTGRES_SUPABASE_SERVICE_ROLE_KEY!
);

export interface SystemMetrics {
  timestamp: number;
  cpu: number;
  memory: number;
  activeUsers: number;
  requestsPerMinute: number;
  errorRate: number;
  avgResponseTime: number;
  dbConnections: number;
  cacheHitRate: number;
  cacheSize: number;
  frontendMetrics: {
    pageLoadTime: number;
    firstContentfulPaint: number;
    timeToInteractive: number;
    jsHeapSize: number;
    jsHeapSizeLimit: number;
    domNodes: number;
    resourcesLoaded: number;
  };
  apiMetrics: {
    endpoint: string;
    method: string;
    responseTime: number;
    statusCode: number;
    errorCount: number;
  }[];
  gameMetrics: {
    activeGames: number;
    averageSessionTime: number;
    concurrentPlayers: number;
    gameErrors: number;
  };
  animationMetrics: {
    fps: number;
    droppedFrames: number;
    animationErrors: number;
  };
}

export class SystemMonitor {
  private metrics: SystemMetrics[] = [];
  private readonly MAX_METRICS = 1000;
  private metricsKey = 'system:metrics';
  private requestCountKey = 'system:requests';
  private errorCountKey = 'system:errors';
  private responseTimeKey = 'system:response_times';
  private frontendMetricsKey = 'system:frontend_metrics';
  private gameMetricsKey = 'system:game_metrics';
  private animationMetricsKey = 'system:animation_metrics';

  async getActiveUsers(): Promise<number> {
    try {
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('last_active', new Date(Date.now() - 5 * 60 * 1000).toISOString());
      return count || 0;
    } catch (error) {
      logger.error('Error getting active users:', error);
      return 0;
    }
  }

  async getRequestsPerMinute(): Promise<number> {
    try {
      const now = Date.now();
      const oneMinuteAgo = now - 60 * 1000;
      const requests = await redis.zrangebyscore(
        this.requestCountKey,
        oneMinuteAgo,
        now
      );
      return requests.length;
    } catch (error) {
      logger.error('Error getting requests per minute:', error);
      return 0;
    }
  }

  async getErrorRate(): Promise<number> {
    try {
      const now = Date.now();
      const oneMinuteAgo = now - 60 * 1000;
      const totalRequests = await redis.zrangebyscore(
        this.requestCountKey,
        oneMinuteAgo,
        now
      ).length;
      const errors = await redis.zrangebyscore(
        this.errorCountKey,
        oneMinuteAgo,
        now
      ).length;
      return totalRequests > 0 ? (errors / totalRequests) * 100 : 0;
    } catch (error) {
      logger.error('Error getting error rate:', error);
      return 0;
    }
  }

  async getAverageResponseTime(): Promise<number> {
    try {
      const now = Date.now();
      const oneMinuteAgo = now - 60 * 1000;
      const responseTimes = await redis.zrangebyscore(
        this.responseTimeKey,
        oneMinuteAgo,
        now
      );
      if (responseTimes.length === 0) return 0;
      const sum = responseTimes.reduce((a: number, b: string) => a + Number(b), 0);
      return sum / responseTimes.length;
    } catch (error) {
      logger.error('Error getting average response time:', error);
      return 0;
    }
  }

  async getDatabaseConnections(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('get_db_connections');
      if (error) throw error;
      return data || 0;
    } catch (error) {
      logger.error('Error getting database connections:', error);
      return 0;
    }
  }

  async getCacheHitRate(): Promise<number> {
    try {
      const hits = Number(await cache.get('cache:hits')) || 0;
      const misses = Number(await cache.get('cache:misses')) || 0;
      const total = hits + misses;
      return total > 0 ? (hits / total) * 100 : 0;
    } catch (error) {
      logger.error('Error getting cache hit rate:', error);
      return 0;
    }
  }

  async getCacheSize(): Promise<number> {
    try {
      return Number(await cache.get('cache:size')) || 0;
    } catch (error) {
      logger.error('Error getting cache size:', error);
      return 0;
    }
  }

  async collectMetrics(): Promise<SystemMetrics> {
    try {
      const startTime = Date.now();
      const metrics: SystemMetrics = {
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

      logger.info('Metrics collected', { metrics });
      return metrics;
    } catch (error) {
      logger.error('Failed to collect metrics:', error);
      throw error;
    }
  }

  async getMetricsHistory(hours: number = 24): Promise<SystemMetrics[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.metrics.filter((m: SystemMetrics) => new Date(m.timestamp) > cutoff);
  }

  async recordRequest(responseTime: number): Promise<void> {
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
      logger.error('Error recording request:', error);
    }
  }

  async recordError(): Promise<void> {
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
      logger.error('Error recording error:', error);
    }
  }

  async checkHealth(): Promise<{ status: string; message: string; lastChecked: string; metrics: SystemMetrics; services: { database: { status: string; error?: string }; cache: { status: string } } }> {
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
      await cache.set(cacheKey, { timestamp: new Date().toISOString() }, { ttl: 60 });
      const cacheStatus = await cache.get(cacheKey);

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
      logger.error('Health check failed:', error);
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

export const monitor = new SystemMonitor(); 