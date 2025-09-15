import { NextResponse } from 'next/server';
import { getPrintifyService } from '@/app/lib/printify/service';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const result = await getPrintifyService().testConnection();

    if (result.success) {
      return NextResponse.json({
        ok: true,
        data: {
          status: 'healthy',
          shopId: result.shopId,
          timestamp: new Date().toISOString(),
        },
      });
    } else {
      return NextResponse.json(
        {
          ok: false,
          error: result.error,
          data: {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 503 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Health check failed',
        data: {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 503 },
    );
  }
}
