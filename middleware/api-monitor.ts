import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { monitor } from '@/lib/monitor';
import { logger } from '@/lib/logger';

export async function apiMonitor(request: NextRequest, response: NextResponse) {
  const startTime = performance.now();
  const path = request.nextUrl.pathname;
  const method = request.method;

  try {
    // Record the request
    await monitor.recordRequest(0); // Initial request time

    // Process the request
    const result = await response;

    // Calculate response time
    const responseTime = performance.now() - startTime;

    // Record API metrics
    await monitor.recordApiMetrics({
      endpoint: path,
      method,
      responseTime,
      statusCode: result.status,
      errorCount: result.status >= 400 ? 1 : 0,
    });

    // Record error if status code indicates failure
    if (result.status >= 400) {
      await monitor.recordError();
      logger.error('API Error', {
        path,
        method,
        status: result.status,
        responseTime,
      });
    }

    return result;
  } catch (error) {
    // Record error
    await monitor.recordError();
    await monitor.recordApiMetrics({
      endpoint: path,
      method,
      responseTime: performance.now() - startTime,
      statusCode: 500,
      errorCount: 1,
    });

    logger.error('API Error', {
      path,
      method,
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
