import { NextResponse } from 'next/server';
import { monitor } from '@/lib/monitor';
import { redis } from '@/lib/redis';

export async function GET() {
  try {
    // Get metrics from Redis
    const metrics = await monitor.getMetrics();

    // Get historical metrics (last 24 hours)
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const historicalMetrics = await redis.zrangebyscore('system:metrics', oneDayAgo, now);

    // Parse historical metrics
    const parsedMetrics = historicalMetrics.map(metric => JSON.parse(metric));

    return NextResponse.json(parsedMetrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
