import { NextResponse } from 'next/server';
import { env } from '@/env.mjs';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Test environment variables
    const hasApiKey = !!env.PRINTIFY_API_KEY;
    const hasShopId = !!env.PRINTIFY_SHOP_ID;

    return NextResponse.json({
      ok: true,
      data: {
        hasApiKey,
        hasShopId,
        shopId: env.PRINTIFY_SHOP_ID,
        apiKeyLength: env.PRINTIFY_API_KEY?.length || 0,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Test failed',
      },
      { status: 500 },
    );
  }
}
