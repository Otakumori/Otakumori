'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.GET = GET;
const server_1 = require('next/server');
const monitor_1 = require('@/lib/monitor');
const redis_1 = require('@/lib/redis');
async function GET() {
  try {
    // Get metrics from Redis
    const metrics = await monitor_1.monitor.getMetrics();
    // Get historical metrics (last 24 hours)
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const historicalMetrics = await redis_1.redis.zrangebyscore('system:metrics', oneDayAgo, now);
    // Parse historical metrics
    const parsedMetrics = historicalMetrics.map(metric => JSON.parse(metric));
    return server_1.NextResponse.json(parsedMetrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return server_1.NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
