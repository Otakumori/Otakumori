require('dotenv').config();
const { monitor } = require('../lib/monitor');
const { logger } = require('../lib/logger');
const { cache } = require('../lib/cache');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

const supabase = createClient(
  process.env.POSTGRES_SUPABASE_URL,
  process.env.POSTGRES_SUPABASE_SERVICE_ROLE_KEY
);

async function generateHealthReport() {
  console.log('Generating system health report...');

  try {
    // Collect current metrics
    const metrics = await monitor.collectMetrics();
    const metricsHistory = await monitor.getMetricsHistory(24); // Last 24 hours

    // Calculate trends
    const trends = {
      cpu: calculateTrend(metricsHistory.map(m => m.cpu)),
      memory: calculateTrend(metricsHistory.map(m => m.memory)),
      errorRate: calculateTrend(metricsHistory.map(m => m.errorRate)),
      responseTime: calculateTrend(metricsHistory.map(m => m.avgResponseTime)),
    };

    // Check database health
    const dbHealth = await checkDatabaseHealth();

    // Check cache health
    const cacheHealth = await checkCacheHealth();

    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      systemStatus: {
        overall: calculateOverallStatus(metrics, dbHealth, cacheHealth),
        cpu: {
          current: metrics.cpu,
          trend: trends.cpu,
          status: metrics.cpu > 80 ? 'warning' : 'healthy',
        },
        memory: {
          current: metrics.memory,
          trend: trends.memory,
          status: metrics.memory > 80 ? 'warning' : 'healthy',
        },
        errorRate: {
          current: metrics.errorRate,
          trend: trends.errorRate,
          status: metrics.errorRate > 5 ? 'warning' : 'healthy',
        },
        responseTime: {
          current: metrics.avgResponseTime,
          trend: trends.responseTime,
          status: metrics.avgResponseTime > 1000 ? 'warning' : 'healthy',
        },
      },
      database: dbHealth,
      cache: cacheHealth,
      activeUsers: metrics.activeUsers,
      requestsPerMinute: metrics.requestsPerMinute,
      recommendations: generateRecommendations(metrics, dbHealth, cacheHealth),
    };

    // Save report to file
    const reportsDir = path.join(process.cwd(), 'reports');
    await fs.mkdir(reportsDir, { recursive: true });
    const reportPath = path.join(reportsDir, `health-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log(`Health report generated successfully: ${reportPath}`);
    return report;
  } catch (error) {
    logger.error('Error generating health report:', error);
    console.error('Error generating health report:', error.message);
    process.exit(1);
  }
}

async function checkDatabaseHealth() {
  try {
    const { data: connections, error: connError } = await supabase.rpc('get_db_connections');
    if (connError) throw connError;

    const { data: tables, error: tablesError } = await supabase.rpc('get_tables');
    if (tablesError) throw tablesError;

    const { data: indexes, error: indexesError } = await supabase.rpc('get_indexes');
    if (indexesError) throw indexesError;

    return {
      status: 'healthy',
      connections: connections || 0,
      tables: tables || [],
      indexes: indexes || [],
      lastCheck: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('Error checking database health:', error);
    return {
      status: 'error',
      error: error.message,
      lastCheck: new Date().toISOString(),
    };
  }
}

async function checkCacheHealth() {
  try {
    const hitRate = await monitor.getCacheHitRate();
    const size = await monitor.getCacheSize();

    return {
      status: hitRate > 50 ? 'healthy' : 'warning',
      hitRate,
      size,
      lastCheck: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('Error checking cache health:', error);
    return {
      status: 'error',
      error: error.message,
      lastCheck: new Date().toISOString(),
    };
  }
}

function calculateTrend(values) {
  if (values.length < 2) return 'stable';
  const first = values[0];
  const last = values[values.length - 1];
  const change = ((last - first) / first) * 100;
  
  if (change > 10) return 'increasing';
  if (change < -10) return 'decreasing';
  return 'stable';
}

function calculateOverallStatus(metrics, dbHealth, cacheHealth) {
  const warnings = [];
  
  if (metrics.cpu > 80) warnings.push('High CPU usage');
  if (metrics.memory > 80) warnings.push('High memory usage');
  if (metrics.errorRate > 5) warnings.push('High error rate');
  if (metrics.avgResponseTime > 1000) warnings.push('Slow response time');
  if (dbHealth.status === 'error') warnings.push('Database issues');
  if (cacheHealth.status === 'error') warnings.push('Cache issues');

  if (warnings.length === 0) return 'healthy';
  if (warnings.length <= 2) return 'warning';
  return 'critical';
}

function generateRecommendations(metrics, dbHealth, cacheHealth) {
  const recommendations = [];

  if (metrics.cpu > 80) {
    recommendations.push('Consider scaling up CPU resources or optimizing CPU-intensive operations');
  }
  if (metrics.memory > 80) {
    recommendations.push('Consider increasing memory allocation or optimizing memory usage');
  }
  if (metrics.errorRate > 5) {
    recommendations.push('Investigate and fix the source of errors');
  }
  if (metrics.avgResponseTime > 1000) {
    recommendations.push('Optimize slow endpoints and consider implementing caching');
  }
  if (metrics.cacheHitRate < 50) {
    recommendations.push('Review and improve caching strategy');
  }
  if (dbHealth.status === 'error') {
    recommendations.push('Address database connectivity issues');
  }
  if (cacheHealth.status === 'error') {
    recommendations.push('Fix cache service issues');
  }

  return recommendations;
}

// Run the report generation
generateHealthReport(); 