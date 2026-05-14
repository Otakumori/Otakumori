import { type NextRequest, NextResponse } from 'next/server';
import { getMerchizeService } from '@/app/lib/merchize/service';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const service = getMerchizeService();
  const result = await service.testConnection();

  return NextResponse.json({
    ok: result.success,
    merchize: result,
    requestedFrom: request.headers.get('user-agent'),
  });
}
