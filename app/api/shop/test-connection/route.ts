import { NextResponse } from 'next/server';
import { env } from '../../../../env';

const PRINTIFY_API_URL = 'https://api.printify.com/v1';

export async function GET() {
  try {
    const shopId = env.PRINTIFY_SHOP_ID;
    const apiKey = env.PRINTIFY_API_KEY;

    if (!shopId || !apiKey) {
      return NextResponse.json({
        status: 'not_configured',
        message: 'Printify credentials not configured',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    const response = await fetch(`${PRINTIFY_API_URL}/shops/${shopId}/products.json`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Printify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json({
      status: 'connected',
      message: 'Successfully connected to Printify API',
      productCount: data.data?.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Printify connection test failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to connect to Printify API',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
