import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    // Log game save auth check
    logger.warn('Game save auth check from:', request.headers.get('user-agent'));

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Authentication required',
          requestId: `auth_${Date.now()}`,
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      ok: true,
      data: { userId },
      requestId: `auth_${Date.now()}`,
    });
  } catch (error) {
    logger.error('Auth check error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
        requestId: `auth_${Date.now()}`,
      },
      { status: 500 },
    );
  }
}
