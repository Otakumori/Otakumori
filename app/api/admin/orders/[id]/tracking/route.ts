import { type NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/app/lib/auth/admin';
import { db } from '@/app/lib/db';
import { generateRequestId } from '@/app/lib/request-id';
import { createApiError } from '@/app/lib/api-contracts';
import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

const TrackingUpdateSchema = z.object({
  number: z.string().optional(),
  carrier: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
});

export const runtime = 'nodejs';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId();
  
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    
    const validation = TrackingUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createApiError(
          'VALIDATION_ERROR',
          'Invalid tracking data',
          requestId,
          validation.error.format(),
        ),
        { status: 400 },
      );
    }
    
    const { number, carrier, url } = validation.data;
    
    // Prepare update data
    const updateData: any = {};
    if (number !== undefined) updateData.trackingNumber = number || null;
    if (carrier !== undefined) updateData.carrier = carrier || null;
    if (url !== undefined) updateData.trackingUrl = url || null;
    
    // If tracking number is set and order hasn't been shipped, update status
    if (number && number.trim() !== '') {
      const order = await db.order.findUnique({
        where: { id },
        select: { status: true, shippedAt: true },
      });
      
      if (order && !order.shippedAt && order.status !== OrderStatus.shipped) {
        updateData.shippedAt = new Date();
        updateData.status = OrderStatus.shipped;
      }
    }
    
    const updatedOrder = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        User: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      ok: true,
      data: updatedOrder,
      requestId,
    });
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('Admin access')) {
      return NextResponse.json(
        createApiError('FORBIDDEN', error.message, requestId),
        { status: 403 },
      );
    }
    
    if (error?.code === 'P2025') {
      return NextResponse.json(
        createApiError('NOT_FOUND', 'Order not found', requestId),
        { status: 404 },
      );
    }
    
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to update tracking', requestId),
      { status: 500 },
    );
  }
}

