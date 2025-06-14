import { NextResponse } from 'next/server';

const PRINTIFY_API_URL = 'https://api.printify.com/v1';
const PRINTIFY_SHOP_ID = env.PRINTIFY_SHOP_ID;
const PRINTIFY_API_KEY = env.PRINTIFY_API_KEY;

export async function GET() {
  try {
    const response = await fetch(`${PRINTIFY_API_URL}/shops/${PRINTIFY_SHOP_ID}/products.json`, {
      headers: {
        Authorization: `Bearer ${PRINTIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Printify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully connected to Printify API',
      productCount: data.data?.length || 0
    });
  } catch (error) {
    console.error('Printify API connection error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to connect to Printify API'
    }, { status: 500 });
  }
} 