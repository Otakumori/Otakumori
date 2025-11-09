import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { env } from '@/env';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Check if environment variables are set
    const hasApiKey = !!env.PRINTIFY_API_KEY;
    const hasShopId = !!env.PRINTIFY_SHOP_ID;

    if (!hasApiKey || !hasShopId) {
      return NextResponse.json({
        error: 'Missing environment variables',
        hasApiKey,
        hasShopId,
        apiKeyLength: env.PRINTIFY_API_KEY?.length || 0,
        shopIdLength: env.PRINTIFY_SHOP_ID?.length || 0,
      });
    }

    // Test the API connection
    const response = await fetch(
      `https://api.printify.com/v1/shops/${env.PRINTIFY_SHOP_ID}/products.json`,
      {
        headers: {
          Authorization: `Bearer ${env.PRINTIFY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const responseText = await response.text();

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      hasApiKey,
      hasShopId,
      apiKeyLength: env.PRINTIFY_API_KEY?.length || 0,
      shopIdLength: env.PRINTIFY_SHOP_ID?.length || 0,
      response: responseText.substring(0, 500), // First 500 chars
      shopIdHash: createHash('sha256').update(env.PRINTIFY_SHOP_ID ?? '').digest('hex'),
      headers: Object.fromEntries(response.headers.entries()),
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      hasApiKey: !!env.PRINTIFY_API_KEY,
      hasShopId: !!env.PRINTIFY_SHOP_ID,
      apiKeyLength: env.PRINTIFY_API_KEY?.length || 0,
      shopIdLength: env.PRINTIFY_SHOP_ID?.length || 0,
    });
  }
}
