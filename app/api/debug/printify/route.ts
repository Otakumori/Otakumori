export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { checkPrintifyHealth } from '@/lib/api/printify';

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const envCheck = {
      PRINTIFY_API_KEY: process.env.PRINTIFY_API_KEY ? '✅ Set' : '❌ Missing',
      PRINTIFY_SHOP_ID: process.env.PRINTIFY_SHOP_ID ? '✅ Set' : '❌ Missing',
      NODE_ENV: process.env.NODE_ENV || 'Not set',
      VERCEL_ENV: process.env.VERCEL_ENVIRONMENT || 'Not set',
    };

    // Check Printify API health
    const health = await checkPrintifyHealth();

    // Test direct API call
    let directTest = null;
    try {
      const response = await fetch(`https://api.printify.com/v1/shops/${process.env.PRINTIFY_SHOP_ID}/products.json?page=1&limit=1`, {
        headers: {
          'Authorization': `Bearer ${process.env.PRINTIFY_API_KEY}`,
        },
        cache: 'no-store'
      });
      
      directTest = {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      directTest = {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      health: health,
      directTest: directTest,
      recommendations: [
        'Check if PRINTIFY_API_KEY and PRINTIFY_SHOP_ID are set in Vercel environment variables',
        'Verify the API key has proper permissions',
        'Check if the shop ID is correct',
        'Ensure the API key is not expired',
      ]
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
