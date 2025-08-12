import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Check system resources
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'healthy',
      message: 'API is running',
      timestamp: new Date().toISOString(),
      framework: 'Next.js',
      environment: process.env.NODE_ENV || 'development',
      responseTime: `${responseTime}ms`,
      uptime: `${Math.floor(uptime)}s`,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      },
      version: process.env.npm_package_version || 'unknown',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
