import { type NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/app/lib/auth/admin';
import { env } from '@/env';

export const runtime = 'nodejs';

export const GET = withAdminAuth(async (_request: NextRequest) => {
  try {
    const hasApiKey = !!env.PRINTIFY_API_KEY;
    const hasShopId = !!env.PRINTIFY_SHOP_ID;

    return NextResponse.json({
      ok: true,
      data: {
        hasApiKey,
        hasShopId,
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
});
