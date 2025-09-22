// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { NextResponse } from 'next/server';
import { env } from '@/env.mjs';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Simple test endpoint working!',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV || 'unknown',
    });
  } catch (error) {
    console.error('Error in simple test:', error);
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
