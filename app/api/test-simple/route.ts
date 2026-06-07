
import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/env.mjs';
import { authorizeAdminApi } from '@/app/lib/auth/admin';

export async function GET(request: NextRequest) {
  const authorization = await authorizeAdminApi(request, 'clerk_admin_or_internal_service');
  if (!authorization.ok) return authorization.response;

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
