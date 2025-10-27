import { type NextRequest } from 'next/server';
import { enhancedPrintifyService } from '@/app/lib/printify/enhanced-service';
import { requireAdminOrThrow } from '@/lib/adminGuard';

export const runtime = 'nodejs';

/**
 * Enhanced Printify sync with external link generation and validation
 * POST /api/v1/printify/enhanced-sync
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdminOrThrow();

    const body = await request.json().catch(() => ({}));
    const { validateLinks = true, fullSync = true } = body;

    console.warn('Starting enhanced Printify sync...', { validateLinks, fullSync });

    let result;

    if (fullSync) {
      // Full product sync with validation
      result = await enhancedPrintifyService.syncProductsWithValidation();
    } else {
      // Just validate existing links
      result = await enhancedPrintifyService.validateAllProductLinks();
    }

    console.warn('Enhanced Printify sync completed:', result);

    return Response.json({
      ok: true,
      data: result,
    });
  } catch (error) {
    console.error('Enhanced Printify sync failed:', error);

    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    );
  }
}

/**
 * Get sync status and statistics
 * GET /api/v1/printify/enhanced-sync
 */
export async function GET() {
  try {
    await requireAdminOrThrow();

    // Get current sync statistics from database
    const stats = await enhancedPrintifyService.validateAllProductLinks();

    return Response.json({
      ok: true,
      data: {
        lastSync: new Date().toISOString(),
        ...stats,
      },
    });
  } catch (error) {
    console.error('Failed to get sync status:', error);

    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    );
  }
}
