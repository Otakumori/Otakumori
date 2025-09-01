 
 
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { monitor } from '../lib/monitor';
import { logger } from '../app/lib/logger';

export async function apiMonitor(request: NextRequest, response: NextResponse) {
  const startTime = performance.now();
  const path = request.nextUrl.pathname;
  const method = request.method;

  try {
    // Record the request
    monitor.log('API request started');

    // Process the request
    const result = await response;

    // Calculate response time
    const responseTime = performance.now() - startTime;

    // Record API metrics
    monitor.log(`API ${method} ${path} - ${result.status} (${responseTime}ms)`);

    // Record error if status code indicates failure
    if (result.status >= 400) {
      monitor.error(`API Error: ${method} ${path} - ${result.status}`);
      logger.error('API Error', {
        route: path,
        extra: { method, status: result.status, responseTime },
      });
    }

    return result;
  } catch (error) {
    // Record error
    monitor.error(`API Error: ${method} ${path} - ${error}`);
    monitor.log(`API ${method} ${path} - 500 (${Date.now() - startTime}ms)`);

    logger.error('API Error', {
      route: path,
      extra: { method, error: error instanceof Error ? error.message : String(error) },
    });

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
