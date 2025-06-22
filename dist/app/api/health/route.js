'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.GET = GET;
const server_1 = require('next/server');
const monitor_1 = require('@/lib/monitor');
async function GET() {
  try {
    const health = await monitor_1.monitor.checkHealth();
    return server_1.NextResponse.json({
      status: health.status,
      message: health.message,
      lastChecked: new Date().toISOString(),
      metrics: health.metrics,
      services: health.services,
    });
  } catch (error) {
    console.error('Error checking health:', error);
    return server_1.NextResponse.json(
      {
        status: 'error',
        message: 'Failed to check system health',
        lastChecked: new Date().toISOString(),
        metrics: null,
        services: {
          database: { status: 'error' },
          cache: { status: 'error' },
        },
      },
      { status: 500 }
    );
  }
}
