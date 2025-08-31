/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
import { NextResponse } from 'next/server';
import { inngest } from '../../../inngest/client';

export async function GET() {
  try {
    // Check if we're in development and Inngest dev server is available
    const isDevelopment = process.env.NODE_ENV === 'development';
    const inngestDevUrl = process.env.INNGEST_SERVE_URL || 'http://localhost:8288';

    // Test sending an event to Inngest
    const result = await inngest.send({
      name: 'test/function',
      data: {
        message: 'Hello from Otakumori!',
        timestamp: new Date().toISOString(),
        test: true,
        environment: process.env.NODE_ENV || 'unknown',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Test event sent to Inngest successfully',
      timestamp: new Date().toISOString(),
      inngestDevUrl,
      isDevelopment,
      result: result || 'Event sent',
    });
  } catch (error) {
    console.error('Error testing Inngest:', error);

    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isInngestError = errorMessage.includes('Inngest') || errorMessage.includes('fetch');

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'unknown',
        inngestDevUrl: process.env.INNGEST_SERVE_URL || 'http://localhost:8288',
        isDevelopment: process.env.NODE_ENV === 'development',
        isInngestError,
        suggestion: isInngestError
          ? 'Make sure Inngest dev server is running on port 8288'
          : 'Check server logs for details',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Send a custom event
    const result = await inngest.send({
      name: body.eventName || 'custom/event',
      data: body.data || {},
    });

    return NextResponse.json({
      success: true,
      message: `Custom event '${body.eventName || 'custom/event'}' sent successfully`,
      timestamp: new Date().toISOString(),
      result: result || 'Event sent',
    });
  } catch (error) {
    console.error('Error sending custom event:', error);
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
