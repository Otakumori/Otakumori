// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const health = {
      ok: true,
      time: new Date().toISOString(),
      versions: {
        node: process.version,
        next: process.env.npm_package_version || 'unknown',
      },
      environment: process.env.NODE_ENV,
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({ ok: false, error: 'Health check failed' }, { status: 500 });
  }
}
