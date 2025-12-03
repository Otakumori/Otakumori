import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { createPrintifyOrder } from '@/app/lib/printify/printifyClient';
import { env } from '@/env.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CreateOrderSchema = z.object({
  line_items: z.array(
    z.object({
      product_id: z.string(),
      variant_id: z.number(),
      quantity: z.number().min(1),
      print_provider_id: z.number().optional(),
    }),
  ),
  shipping_method: z.number(),
  address_to: z.object({
    first_name: z.string(),
    last_name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    country: z.string(),
    region: z.string(),
    address1: z.string(),
    address2: z.string().optional(),
    city: z.string(),
    zip: z.string(),
  }),
  metadata: z
    .object({
      order_source: z.string().default('otakumori_web'),
      user_id: z.string().optional(),
      promotional_code: z.string().optional(),
    })
    .optional(),
});

/**
 * POST /api/v1/orders
 * Create a new order and submit to Printify for fulfillment
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Authentication required' },
        { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } },
      );
    }

    const body = await request.json();
    const orderData = CreateOrderSchema.parse(body);

    // Add user ID to metadata
    if (orderData.metadata) {
      orderData.metadata.user_id = userId;
    } else {
      orderData.metadata = { user_id: userId, order_source: 'otakumori_web' };
    }

    // Create order in Printify
    const printifyOrder = await createPrintifyOrder(env.PRINTIFY_SHOP_ID, {
      external_id: `otm_${Date.now()}_${userId}`,
      line_items: orderData.line_items,
      shipping_method: orderData.shipping_method,
      address_to: orderData.address_to,
    });

    // TODO: Store order in local database for tracking
    // await prisma.order.create({
    //   data: {
    //     userId,
    //     printifyOrderId: printifyOrder.id,
    //     status: 'submitted',
    //     totalAmount: calculateOrderTotal(orderData.line_items),
    //     shippingAddress: orderData.address_to,
    //     lineItems: orderData.line_items,
    //   },
    // });

    return NextResponse.json({
      ok: true,
      data: {
        order: {
          id: printifyOrder.id,
          status: 'submitted',
          estimated_delivery: calculateEstimatedDelivery(String(orderData.shipping_method)),
          tracking_url: null, // Will be available once shipped
        },
        message: 'Order submitted successfully for fulfillment',
      },
      requestId: `otm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  } catch (error) {
    logger.error('Order creation error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid order data',
          details: error.issues,
          requestId: `otm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to create order',
        requestId: `otm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/v1/orders
 * Get user's order history
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Authentication required' },
        { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } },
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const status = searchParams.get('status'); // Filter by order status

    // Log order query params
    logger.warn('Orders requested with filters:', undefined, { limit, offset, status: status || 'all' });

    // TODO: Implement order history retrieval
    // const orders = await prisma.order.findMany({
    //   where: {
    //     userId,
    //     ...(status && { status }),
    //   },
    //   orderBy: { createdAt: 'desc' },
    //   take: limit,
    //   skip: offset,
    //   include: {
    //     lineItems: true,
    //   },
    // });

    const mockOrders: Array<{
      id: string;
      status: string;
      createdAt: string;
      totalAmount: number;
    }> = []; // Placeholder until database is set up

    return NextResponse.json({
      ok: true,
      data: {
        orders: mockOrders,
        pagination: {
          limit,
          offset,
          total: 0,
        },
      },
      requestId: `otm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  } catch (error) {
    logger.error('Order history error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to get order history',
        requestId: `otm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      { status: 500 },
    );
  }
}

/**
 * Helper functions
 */
function calculateEstimatedDelivery(shippingMethod: string): string {
  const now = new Date();
  let deliveryDays: number;

  switch (shippingMethod) {
    case 'express':
      deliveryDays = 3;
      break;
    case 'standard':
      deliveryDays = 7;
      break;
    case 'economy':
      deliveryDays = 14;
      break;
    default:
      deliveryDays = 7;
  }

  const deliveryDate = new Date(now.getTime() + deliveryDays * 24 * 60 * 60 * 1000);
  return deliveryDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
}
