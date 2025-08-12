import { NextResponse } from 'next/server';
import { env } from '../../../env';

export async function GET() {
  try {
    // Check environment variables
    const printifyApiKey = env.PRINTIFY_API_KEY;
    const printifyShopId = env.PRINTIFY_SHOP_ID;
    
    // Check raw process.env
    const rawApiKey = process.env.PRINTIFY_API_KEY;
    const rawShopId = process.env.PRINTIFY_SHOP_ID;

    return NextResponse.json({
      status: 'debug',
      timestamp: new Date().toISOString(),
      env: {
        PRINTIFY_API_KEY: printifyApiKey ? `${printifyApiKey.substring(0, 8)}...` : 'undefined',
        PRINTIFY_SHOP_ID: printifyShopId || 'undefined',
        hasApiKey: !!printifyApiKey,
        hasShopId: !!printifyShopId,
      },
      raw: {
        PRINTIFY_API_KEY: rawApiKey ? `${rawApiKey.substring(0, 8)}...` : 'undefined',
        PRINTIFY_SHOP_ID: rawShopId || 'undefined',
        hasApiKey: !!rawApiKey,
        hasShopId: !!rawShopId,
      },
      message: 'Debug information for Printify environment variables'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
