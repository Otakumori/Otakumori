import { type NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/app/lib/auth/admin';
import { env } from '@/env';

export const runtime = 'nodejs';

export const GET = withAdminAuth(async (_request: NextRequest) => {
  const hasApiKey = !!env.PRINTIFY_API_KEY;
  const hasShopId = !!env.PRINTIFY_SHOP_ID;

  if (!hasApiKey || !hasShopId) {
    return NextResponse.json(
      {
        ok: false,
        printify: {
          configured: false,
          hasApiKey,
          hasShopId,
        },
      },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(
      `https://api.printify.com/v1/shops/${env.PRINTIFY_SHOP_ID}/products.json?page=1&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${env.PRINTIFY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      },
    );

    return NextResponse.json({
      ok: response.ok,
      printify: {
        configured: true,
        status: response.status,
        statusText: response.statusText,
      },
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        printify: {
          configured: true,
          error: 'Printify connection check failed',
        },
      },
      { status: 503 },
    );
  }
});
