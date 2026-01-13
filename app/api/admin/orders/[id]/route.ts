import { type NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/app/lib/auth/admin';
import { db } from '@/app/lib/db';
import { generateRequestId } from '@/app/lib/request-id';
import { createApiError } from '@/app/lib/api-contracts';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId();
  
  try {
    await requireAdmin();
    const { id } = await params;
    
    const order = await db.order.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            id: true,
            email: true,
            displayName: true,
            username: true,
          },
        },
        OrderItem: {
          include: {
            Product: {
              select: {
                id: true,
                name: true,
              },
            },
            ProductVariant: {
              select: {
                id: true,
                title: true,
                sku: true,
              },
            },
          },
        },
      },
    });
    
    if (!order) {
      return NextResponse.json(
        createApiError('NOT_FOUND', 'Order not found', requestId),
        { status: 404 },
      );
    }
    
    return NextResponse.json({
      ok: true,
      data: order,
      requestId,
    });
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('Admin access')) {
      return NextResponse.json(
        createApiError('FORBIDDEN', error.message, requestId),
        { status: 403 },
      );
    }
    
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to fetch order', requestId),
      { status: 500 },
    );
  }
}

