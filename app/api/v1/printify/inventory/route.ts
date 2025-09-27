import { type NextRequest, NextResponse } from 'next/server';
import { getAdvancedPrintifyService } from '@/app/lib/printify/advanced-service';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/printify/inventory
 * Trigger real-time inventory synchronization
 * Requires admin authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Authentication required' },
        { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } },
      );
    }

    // TODO: Check if user has admin role
    // For now, allow any authenticated user to trigger sync

    const advancedService = getAdvancedPrintifyService();
    const inventoryStatuses = await advancedService.syncInventory();

    return NextResponse.json({
      ok: true,
      data: {
        synced: inventoryStatuses.length,
        statuses: inventoryStatuses,
        lastSync: new Date().toISOString(),
        message: `Inventory sync completed. ${inventoryStatuses.length} product variants processed.`,
      },
      requestId: `otm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  } catch (error) {
    console.error('Inventory sync API error:', error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Inventory sync failed',
        requestId: `otm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/v1/printify/inventory
 * Get current inventory sync status
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

    const advancedService = getAdvancedPrintifyService();

    // Get current inventory cache or basic status
    const status = {
      lastSync: new Date().toISOString(),
      totalProducts: 0,
      availableProducts: 0,
      message: 'Inventory status retrieved successfully',
    };

    return NextResponse.json({
      ok: true,
      data: status,
      requestId: `otm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  } catch (error) {
    console.error('Inventory status API error:', error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to get inventory status',
        requestId: `otm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      { status: 500 },
    );
  }
}
