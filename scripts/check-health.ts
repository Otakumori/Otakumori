import { monitor } from '@/lib/monitor';
import { logger } from '@/lib/logger';

// Define thresholds for alerts
const THRESHOLDS = {
  cpu: 80, // 80% CPU usage
  memory: 85, // 85% memory usage
  errorRate: 5, // 5% error rate
  responseTime: 1000, // 1 second response time
  dbConnections: 80, // 80% of max connections
  cacheHitRate: 70, // 70% cache hit rate
};

async function checkHealth() {
  try {
    const health = await monitor.checkHealth();
    const metrics = health.metrics;

    // Check CPU usage
    if (metrics.cpu > THRESHOLDS.cpu) {
      logger.warn(`High CPU usage: ${metrics.cpu}%`);
    }

    // Check memory usage
    if (metrics.memory > THRESHOLDS.memory) {
      logger.warn(`High memory usage: ${metrics.memory}%`);
    }

    // Check error rate
    if (metrics.errorRate > THRESHOLDS.errorRate) {
      logger.warn(`High error rate: ${metrics.errorRate}%`);
    }

    // Check response time
    if (metrics.avgResponseTime > THRESHOLDS.responseTime) {
      logger.warn(`High response time: ${metrics.avgResponseTime}ms`);
    }

    // Check database connections
    if (metrics.dbConnections > THRESHOLDS.dbConnections) {
      logger.warn(`High database connections: ${metrics.dbConnections}`);
    }

    // Check cache hit rate
    if (metrics.cacheHitRate < THRESHOLDS.cacheHitRate) {
      logger.warn(`Low cache hit rate: ${metrics.cacheHitRate}%`);
    }

    // Check service health
    if (health.services.database.status !== 'healthy') {
      logger.error('Database service unhealthy:', health.services.database.error);
    }

    if (health.services.cache.status !== 'healthy') {
      logger.error('Cache service unhealthy');
    }

    logger.info('Health check completed successfully');
  } catch (error) {
    logger.error('Error checking system health:', error);
  }
}

// Run health check every 5 minutes
setInterval(checkHealth, 5 * 60 * 1000);

// Initial health check
checkHealth().catch(error => {
  logger.error('Failed to perform initial health check:', error);
  process.exit(1);
});
