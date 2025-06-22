require('dotenv').config();
const { monitor } = require('../lib/monitor');
const { logger } = require('../lib/logger');
const { cache } = require('../lib/cache');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.POSTGRES_SUPABASE_URL,
  process.env.POSTGRES_SUPABASE_SERVICE_ROLE_KEY
);

async function monitorSystem() {
  console.log('Starting system monitoring...');
  console.log('Press Ctrl+C to stop monitoring\n');

  let lastMetrics = null;
  let alertThresholds = {
    cpu: 80, // 80% CPU usage
    memory: 80, // 80% memory usage
    errorRate: 5, // 5% error rate
    responseTime: 1000, // 1 second
    dbConnections: 80, // 80% of max connections
    cacheHitRate: 50, // 50% cache hit rate
  };

  async function checkAlerts(metrics) {
    const alerts = [];

    if (metrics.cpu > alertThresholds.cpu) {
      alerts.push(`High CPU usage: ${metrics.cpu}%`);
    }
    if (metrics.memory > alertThresholds.memory) {
      alerts.push(`High memory usage: ${metrics.memory}%`);
    }
    if (metrics.errorRate > alertThresholds.errorRate) {
      alerts.push(`High error rate: ${metrics.errorRate}%`);
    }
    if (metrics.avgResponseTime > alertThresholds.responseTime) {
      alerts.push(`Slow response time: ${metrics.avgResponseTime}ms`);
    }
    if (metrics.dbConnections > alertThresholds.dbConnections) {
      alerts.push(`High database connections: ${metrics.dbConnections}%`);
    }
    if (metrics.cacheHitRate < alertThresholds.cacheHitRate) {
      alerts.push(`Low cache hit rate: ${metrics.cacheHitRate}%`);
    }

    if (alerts.length > 0) {
      logger.warn('System alerts:', { alerts });
      console.log('\n⚠️  ALERTS:');
      alerts.forEach(alert => console.log(`- ${alert}`));
    }

    return alerts;
  }

  async function displayMetrics(metrics) {
    const timestamp = new Date().toLocaleTimeString();
    console.clear();
    console.log(`System Status - ${timestamp}\n`);

    // System Resources
    console.log('System Resources:');
    console.log(`CPU Usage: ${metrics.cpu}%`);
    console.log(`Memory Usage: ${metrics.memory}%`);
    console.log(`Active Users: ${metrics.activeUsers}`);
    console.log(`Requests/min: ${metrics.requestsPerMinute}`);
    console.log(`Error Rate: ${metrics.errorRate}%`);
    console.log(`Avg Response Time: ${metrics.avgResponseTime}ms\n`);

    // Database & Cache
    console.log('Database & Cache:');
    console.log(`DB Connections: ${metrics.dbConnections}%`);
    console.log(`Cache Hit Rate: ${metrics.cacheHitRate}%`);
    console.log(`Cache Size: ${metrics.cacheSize} items\n`);

    // Trends
    if (lastMetrics) {
      console.log('Trends:');
      const cpuTrend =
        metrics.cpu > lastMetrics.cpu ? '↑' : metrics.cpu < lastMetrics.cpu ? '↓' : '→';
      const memoryTrend =
        metrics.memory > lastMetrics.memory ? '↑' : metrics.memory < lastMetrics.memory ? '↓' : '→';
      const errorTrend =
        metrics.errorRate > lastMetrics.errorRate
          ? '↑'
          : metrics.errorRate < lastMetrics.errorRate
            ? '↓'
            : '→';

      console.log(`CPU: ${cpuTrend} (${lastMetrics.cpu}% → ${metrics.cpu}%)`);
      console.log(`Memory: ${memoryTrend} (${lastMetrics.memory}% → ${metrics.memory}%)`);
      console.log(`Error Rate: ${errorTrend} (${lastMetrics.errorRate}% → ${metrics.errorRate}%)`);
    }

    await checkAlerts(metrics);
    lastMetrics = metrics;
  }

  try {
    // Initial metrics collection
    const initialMetrics = await monitor.collectMetrics();
    await displayMetrics(initialMetrics);

    // Set up continuous monitoring
    setInterval(async () => {
      try {
        const metrics = await monitor.collectMetrics();
        await displayMetrics(metrics);
      } catch (error) {
        logger.error('Error collecting metrics:', error);
        console.error('Error collecting metrics:', error.message);
      }
    }, 5000); // Update every 5 seconds
  } catch (error) {
    logger.error('Error in system monitoring:', error);
    console.error('Error in system monitoring:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nStopping system monitoring...');
  process.exit(0);
});

monitorSystem();
