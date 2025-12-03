import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { env } from '@/env';
import { createPrintifyOrder } from '@/app/lib/printify/printifyClient';
import type { PrintifyOrderPayload } from '@/app/lib/printify/types';
import { z } from 'zod';

export const runtime = 'nodejs';

const CheckoutOrderSchema = z.object({
  orderId: z.string(),
  lineItems: z.array(
    z.object({
      productId: z.string(),
      printifyProductId: z.string(),
      variantId: z.string(),
      printifyVariantId: z.number(),
      quantity: z.number().positive(),
    }),
  ),
  shippingMethod: z.number(),
  shippingAddress: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    country: z.string(),
    region: z.string(),
    address1: z.string(),
    address2: z.string().optional(),
    city: z.string(),
    zip: z.string(),
  }),
});

/**
 * POST /api/v1/checkout/order
 * Submit an order to Printify for fulfillment
 * Requires authentication
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = CheckoutOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid request',
          details: parsed.error.format(),
        },
        { status: 400 },
      );
    }

    const { orderId, lineItems, shippingMethod, shippingAddress } = parsed.data;

    // Build Printify payload
    const addressTo: PrintifyOrderPayload['address_to'] = {
      first_name: shippingAddress.firstName,
      last_name: shippingAddress.lastName,
      email: shippingAddress.email,
      phone: shippingAddress.phone,
      country: shippingAddress.country,
      region: shippingAddress.region,
      address1: shippingAddress.address1,
      city: shippingAddress.city,
      zip: shippingAddress.zip,
      ...(shippingAddress.address2 ? { address2: shippingAddress.address2 } : {}),
    };

    const printifyPayload: PrintifyOrderPayload = {
      external_id: orderId,
      line_items: lineItems.map((item) => ({
        product_id: item.printifyProductId,
        variant_id: item.printifyVariantId,
        quantity: item.quantity,
      })),
      shipping_method: shippingMethod,
      address_to: addressTo,
    };

    // Submit to Printify
    const shopId = env.PRINTIFY_SHOP_ID;
    if (!shopId) {
      return NextResponse.json(
        { ok: false, error: 'Printify shop is not configured' },
        { status: 500 },
      );
    }
    const printifyOrder = await createPrintifyOrder(shopId, printifyPayload);

    // Store sync record
    await db.printifyOrderSync.create({
      data: {
        localOrderId: orderId,
        printifyOrderId: printifyOrder.id,
        status: 'synced',
        lastSyncAt: new Date(),
      },
    });

    logger.warn(
      `[Printify] Order ${orderId} synced successfully. Printify ID: ${printifyOrder.id}`,
    );

    return NextResponse.json({
      ok: true,
      data: { printifyOrder },
    });
  } catch (error) {
    logger.error('[Printify] Order submission failed:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Log failure to DB
    try {
      const body = await req.json();
      const orderId = body.orderId;

      if (orderId) {
        await db.printifyOrderSync.create({
          data: {
            localOrderId: orderId,
            printifyOrderId: 'failed', // Use placeholder since order creation failed
            status: 'failed',
            error: errorMessage.substring(0, 500), // Limit error message length
          },
        });
      }
    } catch (dbError) {
      logger.error('[Printify] Failed to log error to database:', undefined, undefined, dbError instanceof Error ? dbError : new Error(String(dbError)));
    }

    return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 });
  }
}

/**
 * GET /api/v1/checkout/order?orderId=xxx
 * Get sync status for an order
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ ok: false, error: 'Order ID required' }, { status: 400 });
    }

    const syncRecord = await db.printifyOrderSync.findUnique({
      where: { localOrderId: orderId },
    });

    if (!syncRecord) {
      return NextResponse.json({ ok: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      data: syncRecord,
    });
  } catch (error) {
    logger.error('[Printify] Failed to get order sync status:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
