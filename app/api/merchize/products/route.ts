import { NextResponse } from 'next/server';
import { getMerchizeService } from '@/app/lib/merchize/service';

export const runtime = 'nodejs';

export async function GET() {
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
