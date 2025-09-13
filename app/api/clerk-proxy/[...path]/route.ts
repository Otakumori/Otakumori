// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const { searchParams } = new URL(request.url);
    const path = params.path.join('/');

    // Use official Clerk API instead of custom domain
    const clerkApiUrl = `https://api.clerk.com/v1/${path}${searchParams ? `?${searchParams}` : ''}`;

    const response = await fetch(clerkApiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch from Clerk API' },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Clerk proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const path = params.path.join('/');
    const body = await request.json();

    // Use official Clerk API instead of custom domain
    const clerkApiUrl = `https://api.clerk.com/v1/${path}`;

    const response = await fetch(clerkApiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to post to Clerk API' },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Clerk proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
