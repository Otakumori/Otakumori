import { logger } from '@/app/lib/logger';
import { authorizeProviderWrite } from '@/app/lib/security/providerWriteGuard';
import { env } from '@/env';
import { type NextRequest, NextResponse } from 'next/server';

const PRINTIFY_API_URL = env.PRINTIFY_API_URL || 'https://api.printify.com/v1';
const PRINTIFY_SHOP_ID = env.PRINTIFY_SHOP_ID || '';
const PRINTIFY_API_KEY = env.PRINTIFY_API_KEY || '';

export async function POST(request: NextRequest) {
  const blocked = await authorizeProviderWrite(request, 'printify_order_create');
  if (blocked) return blocked;

  try {
    const { items, shippingAddress } = await request.json();

    if (!PRINTIFY_SHOP_ID || !PRINTIFY_API_KEY) {
      return NextResponse.json(
        { ok: false, error: 'PRINTIFY_NOT_CONFIGURED' },
        { status: 503 },
      );
    }

    if (!Array.isArray(items) || items.length === 0 || !shippingAddress) {
      return NextResponse.json(
        { ok: false, error: 'INVALID_ORDER_PAYLOAD' },
        { status: 400 },
      );
    }

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
        shipping_method: 1,
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
    return NextResponse.json({ ok: true, orderId: order.id });
  } catch (error) {
    logger.error(
      'Error creating Printify order',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json(
      { ok: false, error: 'FAILED_TO_CREATE_PRINTIFY_ORDER' },
      { status: 500 },
    );
  }
}
