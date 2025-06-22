'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const monitor_1 = require('@/lib/monitor');
const redis_1 = require('@/lib/redis');
const logger_1 = require('@/lib/logger');
async function collectMetrics() {
  try {
    // Collect current metrics
    const metrics = await monitor_1.monitor.collectMetrics();
    // Store metrics in Redis with timestamp as score
    await redis_1.redis.zadd('system:metrics', {
      score: Date.now(),
      member: JSON.stringify(metrics),
    });
    // Keep only last 7 days of metrics
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    await redis_1.redis.zremrangebyscore('system:metrics', 0, oneWeekAgo);
    logger_1.logger.info('Metrics collected and stored successfully');
  } catch (error) {
    logger_1.logger.error('Error collecting metrics:', error);
  }
}
// Run metrics collection every minute
setInterval(collectMetrics, 60 * 1000);
// Initial collection
collectMetrics().catch(error => {
  logger_1.logger.error('Failed to collect initial metrics:', error);
  process.exit(1);
});
