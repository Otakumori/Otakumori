import { type NextRequest, NextResponse } from 'next/server';
import { getMerchizeService } from '@/app/lib/merchize/service';
import { authorizeAdminApi } from '@/app/lib/auth/admin';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const authorization = await authorizeAdminApi(request, 'clerk_admin_or_internal_service');
  if (!authorization.ok) return authorization.response;

  try {
    const products = await getMerchizeService().getProducts();

    return NextResponse.json({
      ok: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
