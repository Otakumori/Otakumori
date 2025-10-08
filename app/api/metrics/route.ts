// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
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
    // Parse historical metrics
    const parsedMetrics: any[] = [];

    return NextResponse.json(parsedMetrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    // TODO: Integrate HTTP-based Redis client to store metrics
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing metrics:', error);
    return NextResponse.json({ error: 'Failed to store metrics' }, { status: 500 });
  }
}
