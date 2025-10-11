import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET(request: NextRequest) {
  try {
    // Log test error request
    console.warn('Sentry test error triggered from:', request.headers.get('user-agent'));

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
