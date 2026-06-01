import { logger } from '@/app/lib/logger';
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

    logger.warn('Starting enhanced Printify sync...', undefined, { validateLinks, fullSync });

    let result;

    if (fullSync) {
      // Full product sync with validation
      result = await enhancedPrintifyService.syncProductsWithValidation();
    } else {
      // Just validate existing links
      result = await enhancedPrintifyService.validateAllProductLinks();
    }

    logger.warn('Enhanced Printify sync completed:', undefined, { value: result });

    return Response.json({
      ok: true,
      data: result,
    });
  } catch (error) {
    logger.error('Enhanced Printify sync failed:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));

    return Response.json(
      {
        ok: false,
        error: 'Enhanced Printify sync failed',
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

    return Response.json({
      ok: true,
      data: {
        status: 'available',
        checkedAt: new Date().toISOString(),
        note: 'Use POST /api/v1/printify/enhanced-sync for validation or sync work.',
      },
    });
  } catch (error) {
    logger.error('Failed to get sync status:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));

    return Response.json(
      {
        ok: false,
        error: 'Unable to load enhanced Printify sync status',
      },
      { status: 500 },
    );
  }
}
