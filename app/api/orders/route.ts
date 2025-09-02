 
 
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 10;
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId  } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // Get user's orders
    const orders = await db.order.findMany({
      where: { userId: user.id },
      include: {
        OrderItem: {
          include: {
            Product: true,
            ProductVariant: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform orders for frontend
    const transformedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.displayNumber,
      status: order.status,
      total: order.totalAmount / 100, // Convert from cents
      currency: order.currency,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      shippedAt: order.shippedAt,
      trackingUrl: order.trackingUrl,
      carrier: order.carrier,
      trackingNumber: order.trackingNumber,
      items: order.OrderItem.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.unitAmount / 100, // Convert from cents
        sku: item.sku,
        product: item.Product
          ? {
              id: item.Product.id,
              name: item.Product.name,
              primaryImageUrl: item.Product.primaryImageUrl,
            }
          : null,
        variant: item.ProductVariant
          ? {
              id: item.ProductVariant.id,
              name: item.ProductVariant.printProviderName || 'Standard',
            }
          : null,
      })),
    }));

    return NextResponse.json({
      ok: true,
      data: { orders: transformedOrders },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
