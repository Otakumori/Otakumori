import { type NextRequest, NextResponse } from 'next/server';
import { getPrintifyProducts } from '@/src/services/printify';
import { logger } from '@/app/lib/logger';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const revalidate = 60;

export async function GET(request: NextRequest) {
  const requestId = uuidv4();
  const startTime = Date.now();

  logger.request(request, `GET /api/printify/products`, { requestId });

  try {
    const result = await getPrintifyProducts();

    if (!result.ok) {
      logger.error('Failed to fetch Printify products', {
        requestId,
        // error: result.error,
      });

      return NextResponse.json(
        {
          ok: false,
          error: 'Failed to fetch products from Printify',
          detail: result.error,
          requestId,
        },
        { status: 502 },
      );
    }

    const duration = Date.now() - startTime;
    logger.info(`GET /api/printify/products response 200`, {
      requestId,
      // duration,
      // itemCount: result.data.length,
    });

    return NextResponse.json(
      {
        ok: true,
        data: { items: result.data },
        requestId,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      },
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Unexpected error in Printify products API', {
      requestId,
      // error: error instanceof Error ? error.message : "Unknown error",
      // duration,
    });

    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
        requestId,
      },
      { status: 500 },
    );
  }
}
