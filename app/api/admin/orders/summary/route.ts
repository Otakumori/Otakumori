import { type NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/app/lib/auth/admin';
import { db } from '@/app/lib/db';
import { generateRequestId } from '@/app/lib/request-id';
import { createApiError } from '@/app/lib/api-contracts';
import { OrderStatus } from '@prisma/client';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    await requireAdmin();
    
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const thisYearStart = new Date(now.getFullYear(), 0, 1);
    
    // Get all paid orders (not cancelled)
    const paidOrders = {
      status: { not: OrderStatus.cancelled },
      paidAt: { not: null },
    };
    
    // Aggregate queries for performance
    const [
      totalRevenue,
      totalOrders,
      pendingOrders,
      inProductionOrders,
      shippedOrders,
      cancelledOrders,
      thisMonthRevenue,
      lastMonthRevenue,
      thisYearRevenue,
    ] = await Promise.all([
      // Total revenue (paid orders only)
      db.order.aggregate({
        where: paidOrders,
        _sum: { totalAmount: true },
      }),
      
      // Total orders count
      db.order.count({ where: { status: { not: OrderStatus.cancelled } } }),
      
      // Pending orders
      db.order.count({ where: { status: OrderStatus.pending } }),
      
      // In production orders
      db.order.count({ where: { status: OrderStatus.in_production } }),
      
      // Shipped orders
      db.order.count({ where: { status: OrderStatus.shipped } }),
      
      // Cancelled orders
      db.order.count({ where: { status: OrderStatus.cancelled } }),
      
      // This month revenue
      db.order.aggregate({
        where: {
          ...paidOrders,
          createdAt: { gte: thisMonthStart },
        },
        _sum: { totalAmount: true },
      }),
      
      // Last month revenue
      db.order.aggregate({
        where: {
          ...paidOrders,
          createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
        },
        _sum: { totalAmount: true },
      }),
      
      // This year revenue
      db.order.aggregate({
        where: {
          ...paidOrders,
          createdAt: { gte: thisYearStart },
        },
        _sum: { totalAmount: true },
      }),
    ]);
    
    // Calculate total refunds from FinancialTransaction
    const refunds = await db.financialTransaction.aggregate({
      where: {
        type: 'refund',
      },
      _sum: { amount: true },
    });
    
    const totalRefunds = Math.abs(refunds._sum.amount || 0);
    
    return NextResponse.json({
      ok: true,
      data: {
        totalRevenue: totalRevenue._sum?.totalAmount || 0,
        totalOrders,
        pendingOrders,
        inProductionOrders,
        shippedOrders,
        cancelledOrders,
        thisMonth: thisMonthRevenue._sum?.totalAmount || 0,
        lastMonth: lastMonthRevenue._sum?.totalAmount || 0,
        thisYear: thisYearRevenue._sum?.totalAmount || 0,
        totalRefunds,
      },
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
      createApiError('INTERNAL_ERROR', 'Failed to fetch order summary', requestId),
      { status: 500 },
    );
  }
}

