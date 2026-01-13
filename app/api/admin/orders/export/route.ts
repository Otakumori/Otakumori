import { type NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/app/lib/auth/admin';
import { db } from '@/app/lib/db';
import { generateRequestId } from '@/app/lib/request-id';
import { createApiError } from '@/app/lib/api-contracts';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    
    const format = searchParams.get('format') || 'csv';
    const status = searchParams.get('status');
    const dateRange = searchParams.get('dateRange') || 'all';
    const search = searchParams.get('search');
    
    if (format !== 'csv') {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'Only CSV format is supported', requestId),
        { status: 400 },
      );
    }
    
    const where: any = {};
    
    // Filter by status
    if (status && status !== 'all') {
      where.status = status;
    }
    
    // Filter by date range
    if (dateRange !== 'all') {
      const days = parseInt(dateRange.replace('days', ''), 10);
      if (!isNaN(days)) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        where.createdAt = { gte: startDate };
      }
    }
    
    // Search across multiple fields
    if (search) {
      const searchNum = parseInt(search, 10);
      where.OR = [
        ...(isNaN(searchNum) ? [] : [{ displayNumber: searchNum }]),
        { User: { email: { contains: search, mode: 'insensitive' } } },
        { primaryItemName: { contains: search, mode: 'insensitive' } },
        { stripeId: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Get orders with all related data
    const orders = await db.order.findMany({
      where,
      include: {
        User: {
          select: {
            email: true,
            displayName: true,
          },
        },
        OrderItem: {
          select: {
            name: true,
            quantity: true,
            unitAmount: true,
            sku: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10000, // Large limit for exports
    });
    
    // Generate CSV
    const headers = [
      'Order Number',
      'Date',
      'Customer Email',
      'Customer Name',
      'Status',
      'Items',
      'Item SKUs',
      'Subtotal',
      'Tax',
      'Shipping',
      'Discount',
      'Total',
      'Paid At',
      'Shipped At',
      'Tracking Number',
      'Carrier',
      'Stripe ID',
    ];
    
    const rows = orders.map((order) => {
      const items = order.OrderItem.map((item) => `${item.name} (x${item.quantity})`).join('; ');
      const skus = order.OrderItem.map((item) => item.sku).join('; ');
      const customerName = order.User.displayName || '';
      
      return [
        order.displayNumber.toString(),
        new Date(order.createdAt).toISOString().split('T')[0],
        order.User.email,
        customerName,
        order.status,
        items,
        skus,
        (order.subtotalCents / 100).toFixed(2),
        ((order.taxAmount || 0) / 100).toFixed(2),
        ((order.shippingAmount || 0) / 100).toFixed(2),
        ((order.discountAmount || 0) / 100).toFixed(2),
        (order.totalAmount / 100).toFixed(2),
        order.paidAt ? new Date(order.paidAt).toISOString().split('T')[0] : '',
        order.shippedAt ? new Date(order.shippedAt).toISOString().split('T')[0] : '',
        order.trackingNumber || '',
        order.carrier || '',
        order.stripeId,
      ];
    });
    
    // Escape CSV values and handle special characters
    const escapeCsv = (value: string): string => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };
    
    const csvContent = [
      headers.map(escapeCsv).join(','),
      ...rows.map((row: string[]) => row.map((cell: string) => escapeCsv(String(cell))).join(',')),
    ].join('\n');
    
    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="orders-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('Admin access')) {
      return NextResponse.json(
        createApiError('FORBIDDEN', error.message, requestId),
        { status: 403 },
      );
    }
    
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to export orders', requestId),
      { status: 500 },
    );
  }
}

