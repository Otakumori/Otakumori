import { logger } from '@/app/lib/logger';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { authorizeProviderWrite } from '@/app/lib/security/providerWriteGuard';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const guard = await authorizeProviderWrite(request, { developmentOnly: true });
  if (!guard.ok) return guard.response;

  try {
    // Log test error request
    logger.warn('Sentry test error triggered from:', undefined, { value: request.headers.get('user-agent') });

    // This will trigger a server-side error that Sentry will capture
    throw new Error('Test server-side error for Sentry!');
  } catch (error) {
    // Capture the error with Sentry
    Sentry.captureException(error);

    return NextResponse.json(
      {
        ok: false,
        error: 'Test error triggered successfully',
        message: 'Check your Sentry dashboard for the captured error',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const guard = await authorizeProviderWrite(request, { developmentOnly: true });
  if (!guard.ok) return guard.response;

  try {
    const body = await request.json();

    // Capture a custom message
    Sentry.captureMessage(
      `Test message from API: ${body.message || 'No message provided'}`,
      'info',
    );

    return NextResponse.json({
      ok: true,
      message: 'Test message sent to Sentry successfully',
    });
  } catch (error) {
    Sentry.captureException(error);

    return NextResponse.json({ ok: false, error: 'Failed to process request' }, { status: 500 });
  }
}
