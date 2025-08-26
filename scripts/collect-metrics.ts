/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { monitor } from '../lib/monitor';
import { logger } from '../app/lib/logger';
import { redis } from './lib/redis';

async function collectMetrics() {
  try {
    // Collect current metrics
    const metrics = await monitor.collectMetrics();

    // Store metrics in Redis with timestamp as score
    await redis.zadd('system:metrics', {
      score: Date.now(),
      member: JSON.stringify(metrics),
    });

    // Keep only last 7 days of metrics
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    await redis.zremrangebyscore('system:metrics', 0, oneWeekAgo);

    logger.info('Metrics collected and stored successfully');
  } catch (error) {
    logger.error('Error collecting metrics', { extra: { error: error instanceof Error ? error.message : String(error) } });
  }
}

// Run metrics collection every minute
setInterval(collectMetrics, 60 * 1000);

// Initial collection
collectMetrics().catch(error => {
  logger.error('Failed to collect initial metrics', { extra: { error: error instanceof Error ? error.message : String(error) } });
  process.exit(1);
});
