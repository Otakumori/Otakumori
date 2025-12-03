import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/env.mjs';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Log debug request for audit
    logger.warn('Printify debug requested from:', undefined, {
      userAgent: request.headers.get('user-agent'),
    });

    // Check if environment variables are loaded
    const printifyApiKey = env.PRINTIFY_API_KEY;
    const printifyApiUrl = env.PRINTIFY_API_URL;
    const printifyShopId = env.PRINTIFY_SHOP_ID;

    // Don't expose the full API key, just show if it exists and first few characters
    const maskedApiKey = printifyApiKey ? `${printifyApiKey.substring(0, 20)}...` : 'NOT_FOUND';

    return NextResponse.json({
      ok: true,
      debug: {
        PRINTIFY_API_KEY: maskedApiKey,
        PRINTIFY_API_KEY_LENGTH: printifyApiKey?.length || 0,
        PRINTIFY_API_URL: printifyApiUrl || 'NOT_FOUND',
        PRINTIFY_SHOP_ID: printifyShopId || 'NOT_FOUND',
        NODE_ENV: env.NODE_ENV,
        // Test the actual API call
        testApiCall: await testPrintifyApi(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      error: error.message,
      stack: error.stack,
    });
  }
}

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
      status: res.status,
      statusText: res.statusText,
      headers: Object.fromEntries(res.headers.entries()),
      body: res.ok ? await res.text() : await res.text(),
    };
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
}
