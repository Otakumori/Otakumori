import { type NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/app/lib/auth/admin';
import { logger } from '@/app/lib/logger';
import { env } from '@/env.mjs';

export const runtime = 'nodejs';

export const GET = withAdminAuth(async (request: NextRequest) => {
  logger.warn('Printify debug check requested', undefined, {
    path: request.nextUrl.pathname,
  });

  const hasApiKey = !!env.PRINTIFY_API_KEY;
  const hasShopId = !!env.PRINTIFY_SHOP_ID;
  const hasApiUrl = !!env.PRINTIFY_API_URL;

  if (!hasApiKey || !hasShopId || !hasApiUrl) {
    return NextResponse.json(
      {
        ok: false,
        printify: {
          configured: false,
          hasApiKey,
          hasShopId,
          hasApiUrl,
        },
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    printify: {
      configured: true,
      testApiCall: await testPrintifyApi(),
    },
  });
});

async function testPrintifyApi() {
  try {
    const res = await fetch(
      `${env.PRINTIFY_API_URL}shops/${env.PRINTIFY_SHOP_ID}/products.json?page=1&per_page=1`,
      {
        headers: {
          Authorization: `Bearer ${env.PRINTIFY_API_KEY}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Otaku-mori/1.0.0 (Node.js)',
        },
        cache: 'no-store',
      },
    );

    return {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
    };
  } catch {
    return {
      ok: false,
      error: 'Printify API check failed',
    };
  }
}
