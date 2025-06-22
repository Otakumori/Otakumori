'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.apiMonitor = apiMonitor;
const server_1 = require('next/server');
const monitor_1 = require('@/lib/monitor');
const logger_1 = require('@/lib/logger');
async function apiMonitor(request, response) {
  const startTime = performance.now();
  const path = request.nextUrl.pathname;
  const method = request.method;
  try {
    // Record the request
    await monitor_1.monitor.recordRequest(0); // Initial request time
    // Process the request
    const result = await response;
    // Calculate response time
    const responseTime = performance.now() - startTime;
    // Record API metrics
    await monitor_1.monitor.recordApiMetrics({
      endpoint: path,
      method,
      responseTime,
      statusCode: result.status,
      errorCount: result.status >= 400 ? 1 : 0,
    });
    // Record error if status code indicates failure
    if (result.status >= 400) {
      await monitor_1.monitor.recordError();
      logger_1.logger.error('API Error', {
        path,
        method,
        status: result.status,
        responseTime,
      });
    }
    return result;
  } catch (error) {
    // Record error
    await monitor_1.monitor.recordError();
    await monitor_1.monitor.recordApiMetrics({
      endpoint: path,
      method,
      responseTime: performance.now() - startTime,
      statusCode: 500,
      errorCount: 1,
    });
    logger_1.logger.error('API Error', {
      path,
      method,
      error: error instanceof Error ? error.message : String(error),
    });
    return server_1.NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
