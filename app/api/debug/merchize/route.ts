import { type NextRequest, NextResponse } from 'next/server';
import { getMerchizeService } from '@/app/lib/merchize/service';
import { env } from '@/env';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const service = getMerchizeService();
  const result = await service.testConnection();

  return NextResponse.json({
    ok: result.success,
    merchize: result,
    requestedFrom: request.headers.get('user-agent'),
    envPreview: {
      MERCHIZE_API_URL:
        env.MERCHIZE_API_URL ||
        env.MERCHIZE_STORE_API_URL ||
        'NOT_SET',
      MERCHIZE_ACCESS_TOKEN:
        env.MERCHIZE_ACCESS_TOKEN || env.MERCHIZE_API_TOKEN
          ? 'SET'
          : 'NOT_SET',
    },
  });
}
