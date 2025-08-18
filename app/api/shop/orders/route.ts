import { NextResponse } from 'next/server';
import { env } from '@/env.mjs';

const PRINTIFY_API_URL = 'https://api.printify.com/v1';
const PRINTIFY_SHOP_ID = env.PRINTIFY_SHOP_ID || '';
const PRINTIFY_API_KEY = env.PRINTIFY_API_KEY || '';

export async function POST(request: Request) {
  try {
    const { items, shippingAddress } = await request.json();

    // Create order with Printify
    const response = await fetch(`${PRINTIFY_API_URL}/shops/${PRINTIFY_SHOP_ID}/orders.json`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PRINTIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        external_id: `otakumori-${Date.now()}`,
        line_items: items.map((item: any) => ({
          blueprint_id: item.productId,
          variant_id: item.variantId,
          quantity: item.quantity,
        })),
        shipping_method: 1, // Standard shipping
        shipping_address: {
          first_name: shippingAddress.first_name,
          last_name: shippingAddress.last_name,
          email: shippingAddress.email,
          phone: shippingAddress.phone,
          address1: shippingAddress.address1,
          address2: shippingAddress.address2 || '',
          city: shippingAddress.city,
          region: shippingAddress.state,
          zip: shippingAddress.zip,
          country: shippingAddress.country,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Printify API error: ${response.status} ${response.statusText}`);
    }

    const order = await response.json();

    // TODO: Store order in your database if needed
    // For now, just return the Printify order ID

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    );
  }
}
