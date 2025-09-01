 
 
const fs = require('fs');
const path = require('path');
const { monitor } = require('../lib/monitor');
const { logger } = require('../lib/logger');

async function generateReport() {
  try {
    logger.info('Starting health report generation');

    // Get system health
    const health = await monitor.checkHealth();

    // Get metrics history
    const metrics = await monitor.getMetricsHistory(24);

    // Calculate statistics
    const stats = {
      activeUsers: {
        min: Math.min(...metrics.map((m) => m.activeUsers)),
        max: Math.max(...metrics.map((m) => m.activeUsers)),
        avg: metrics.reduce((sum, m) => sum + m.activeUsers, 0) / metrics.length,
      },
      responseTime: {
        min: Math.min(...metrics.map((m) => m.responseTime)),
        max: Math.max(...metrics.map((m) => m.responseTime)),
        avg: metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length,
      },
      cpuUsage: {
        min: Math.min(...metrics.map((m) => m.cpuUsage)),
        max: Math.max(...metrics.map((m) => m.cpuUsage)),
        avg: metrics.reduce((sum, m) => sum + m.cpuUsage, 0) / metrics.length,
      },
      memoryUsage: {
        min: Math.min(...metrics.map((m) => m.memoryUsage)),
        max: Math.max(...metrics.map((m) => m.memoryUsage)),
        avg: metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / metrics.length,
      },
      databaseConnections: {
        min: Math.min(...metrics.map((m) => m.databaseConnections)),
        max: Math.max(...metrics.map((m) => m.databaseConnections)),
        avg: metrics.reduce((sum, m) => sum + m.databaseConnections, 0) / metrics.length,
      },
    };

    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      health,
      stats,
      metrics,
    };

    // Save report
    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.join(
      reportsDir,
      `health-report-${new Date().toISOString().split('T')[0]}.json`,
    );
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    logger.info('Health report generated successfully', { reportPath });
  } catch (error) {
    logger.error('Health report generation failed', { error });
    process.exit(1);
  }
}

generateReport();
