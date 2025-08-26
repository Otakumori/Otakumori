/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
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
