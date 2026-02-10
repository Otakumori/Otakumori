
import { NextResponse } from 'next/server';
import { env } from '@/env.mjs';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Simple test endpoint working!',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV || 'unknown',
    });
  } catch (error) {
    const { logger } = await import('@/app/lib/logger');
    logger.error(
      'Error in simple test:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
