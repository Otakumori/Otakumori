import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/env.mjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if PostHog is configured
    const posthogKey = env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!posthogKey) {
      return NextResponse.json(
        {
          ok: false,
          error: 'PostHog not configured',
          details: 'NEXT_PUBLIC_POSTHOG_KEY environment variable not set',
        },
        { status: 503 },
      );
    }

    // Send test event to PostHog
    const posthogUrl = env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';
    const response = await fetch(`${posthogUrl}/capture/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Otaku-mori-Debug/1.0',
      },
      body: JSON.stringify({
        api_key: posthogKey,
        event: 'debug_test',
        distinct_id: 'debug-user',
        properties: {
          timestamp: new Date().toISOString(),
          source: 'debug_endpoint',
          ...body,
        },
      }),
    });

    if (response.ok) {
      return NextResponse.json({
        ok: true,
        message: 'PostHog test event sent successfully',
        timestamp: new Date().toISOString(),
        posthogUrl,
        eventData: {
          event: 'debug_test',
          distinct_id: 'debug-user',
          properties: body,
        },
      });
    } else {
      const errorText = await response.text();
      return NextResponse.json(
        {
          ok: false,
          error: 'PostHog request failed',
          details: errorText,
          status: response.status,
        },
        { status: 502 },
      );
    }
  } catch (error) {
    console.error('PostHog debug error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'PostHog debug failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export const runtime = 'nodejs';
