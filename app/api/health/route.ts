import { NextResponse } from 'next/server';
import { monitor } from '../../lib/monitor';

export async function GET() {
  try {
    const health = await monitor.checkHealth();

    return NextResponse.json({
      status: health.status,
      message: health.message,
      lastChecked: new Date().toISOString(),
      metrics: health.metrics,
      services: health.services,
    });
  } catch (error) {
    console.error('Error checking health:', error);
    return NextResponse.json(
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
