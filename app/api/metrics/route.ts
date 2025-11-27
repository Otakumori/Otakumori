
import { NextResponse } from 'next/server';
import { monitor } from '@/lib/monitor';
// import { redis } from '../../lib/redis';
// TODO: Replace with HTTP-based Redis client if needed

export async function GET() {
  try {
    // Get metrics from Redis
    const metrics = await monitor.getMetrics();
    console.warn(`Metrics requested: ${Object.keys(metrics).length} metric types`);

    // Get historical metrics (last 24 hours)
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    console.warn(`Historical metrics from: ${new Date(oneDayAgo).toISOString()}`);

    // TODO: Integrate HTTP-based Redis client to fetch historical metrics
    const historicalMetrics: any[] = [];

    // Parse and enrich metrics with historical data
    const parsedMetrics = Object.entries(metrics).map(([key, value]) => ({
      metric: key,
      current: value,
      timestamp: now,
      historicalAvailable: historicalMetrics.length > 0,
    }));

    return NextResponse.json({
      metrics: parsedMetrics,
      period: { from: oneDayAgo, to: now },
      historicalCount: historicalMetrics.length,
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.warn('Metrics POST received:', { metricCount: Object.keys(data).length });

    // TODO: Integrate HTTP-based Redis client to store metrics
    // For now, just log and acknowledge receipt
    if (data && typeof data === 'object') {
      console.warn('Metrics data received:', Object.keys(data));
    }

    return NextResponse.json({
      success: true,
      received: Object.keys(data).length,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error storing metrics:', error);
    return NextResponse.json({ error: 'Failed to store metrics' }, { status: 500 });
  }
}
