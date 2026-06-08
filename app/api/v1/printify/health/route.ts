import { type NextRequest, NextResponse } from 'next/server';
import { getPrintifyService } from '@/app/lib/printify/service';
import { authorizeAdminApi } from '@/app/lib/auth/admin';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const authorization = await authorizeAdminApi(request, 'clerk_admin_or_internal_service');
  if (!authorization.ok) return authorization.response;

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
