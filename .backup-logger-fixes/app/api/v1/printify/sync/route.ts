import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { inngest } from '@/inngest/client';
import { getPrintifyService } from '@/app/lib/printify/service';
import { syncPrintifyProducts } from '@/lib/catalog/printifySync';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { type = 'manual' } = await request.json();

    let result;

    switch (type) {
      case 'manual':
        // Trigger manual sync
        result = await inngest.send({
          name: 'printify/manual-sync',
          data: { timestamp: new Date().toISOString() },
        });
        break;

      case 'test':
        // Test connection only
        const connectionTest = await getPrintifyService().testConnection();
        return NextResponse.json({
          ok: connectionTest.success,
          data: {
            type: 'test',
            success: connectionTest.success,
            shopId: connectionTest.shopId,
            error: connectionTest.error,
            timestamp: new Date().toISOString(),
          },
        });

      case 'products':
        // Sync products immediately
        const products = await getPrintifyService().getAllProducts();
        const syncResult = await syncPrintifyProducts(products, { hideMissing: true });
        return NextResponse.json({
          ok: true,
          data: {
            type: 'products',
            productCount: syncResult.upserted,
            hiddenCount: syncResult.hidden,
            timestamp: syncResult.lastSync,
            errors: syncResult.errors,
          },
        });

      default:
        return NextResponse.json(
          {
            ok: false,
            error: 'Invalid sync type. Use: manual, test, or products',
          },
          { status: 400 },
        );
    }

    return NextResponse.json({
      ok: true,
      data: {
        type,
        eventId: result.ids?.[0],
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Printify sync API error:', error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      },
      { status: 500 },
    );
  }
}
