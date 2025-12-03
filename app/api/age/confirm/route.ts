import { logger } from '@/app/lib/logger';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { env } from '@/env';

const confirmSchema = z.object({
  returnTo: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = confirmSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid request: returnTo is required',
        },
        { status: 400 },
      );
    }

    const { returnTo } = result.data;

    // Sanitize returnTo to prevent open redirects
    // Must be a relative path starting with /
    if (!returnTo.startsWith('/') || returnTo.startsWith('//')) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid redirect path',
        },
        { status: 400 },
      );
    }

    // Create response with session-only cookie
    const response = NextResponse.json({
      ok: true,
      data: { redirectTo: returnTo },
    });

    // Set session-only cookie (no maxAge/expires)
    const isProduction = env.NODE_ENV === 'production';
    response.cookies.set('om_age_ok', '1', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: isProduction,
      // No maxAge or expires -> session-only cookie
    });

    return response;
  } catch (error) {
    logger.error(
      'Failed to confirm age',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}
