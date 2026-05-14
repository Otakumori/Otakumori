import { type NextRequest, NextResponse } from 'next/server';
import { getMerchizeService } from '@/app/lib/merchize/service';
import { withAdminAuth } from '@/app/lib/auth/admin';

export const runtime = 'nodejs';

export const GET = withAdminAuth(async (_request: NextRequest) => {
  try {
    const service = getMerchizeService();
    const result = await service.testConnection();

    return NextResponse.json({
      ok: result.success,
      merchize: {
        success: result.success,
        endpoint: result.endpoint,
        status: result.status,
        productCount: result.productCount,
        error: result.error,
        sampleKeys: result.sampleKeys,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        merchize: {
          success: false,
          error: error instanceof Error ? error.message : 'Merchize debug check failed',
        },
      },
      { status: 503 },
    );
  }
});
