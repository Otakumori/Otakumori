// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { NextResponse } from 'next/server';
import { env } from '@/env';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    features: {
      authentication: true,
      database: true,
      search: true,
      notifications: true,
      contentModeration: true,
      userActivity: true,
      trendingContent: true,
    },
  });
}
