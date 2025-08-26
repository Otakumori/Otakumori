export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env.mjs';

export async function GET() {
  try {
    // Check environment variables
    const hasApiKey = !!env.PRINTIFY_API_KEY;
    const hasShopId = !!env.PRINTIFY_SHOP_ID;
    
    // Test Printify API directly
    let apiTest = null;
    if (hasApiKey && hasShopId) {
      try {
        const response = await fetch(`https://api.printify.com/v1/shops/${env.PRINTIFY_SHOP_ID}/products.json`, {
          headers: {
            'Authorization': `Bearer ${env.PRINTIFY_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          apiTest = {
            status: response.status,
            productCount: data.data?.length || 0,
            firstProduct: data.data?.[0]?.title || 'No products found'
          };
        } else {
          apiTest = {
            status: response.status,
            error: response.statusText
          };
        }
      } catch (error) {
        apiTest = {
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: {
        hasApiKey,
        hasShopId,
        apiKeyLength: env.PRINTIFY_API_KEY?.length || 0,
        shopId: env.PRINTIFY_SHOP_ID || 'Not set'
      },
      apiTest,
      message: 'Printify API debug information'
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
