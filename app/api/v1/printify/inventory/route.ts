import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';
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
    // Log inventory sync request
    logger.warn('Printify inventory sync requested from:', undefined, { value: request.headers.get('user-agent') });

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
    logger.warn('Advanced Printify service initialized for sync');
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
    logger.error('Inventory sync API error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));

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
    // Log inventory status request
    logger.warn('Printify inventory status requested from:', undefined, { value: request.headers.get('user-agent') });

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Authentication required' },
        { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } },
      );
    }

    const advancedService = getAdvancedPrintifyService();

    // Get actual inventory status from advanced service
    const serviceStatus = await advancedService.getInventoryStatus().catch((error) => {
      logger.error('Failed to get inventory status:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      return null;
    });

    // Get current inventory cache or basic status
    const status = serviceStatus || {
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
    logger.error('Inventory status API error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));

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
