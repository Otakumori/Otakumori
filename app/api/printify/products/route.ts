import { type NextRequest, NextResponse } from 'next/server';
import { getPrintifyService } from '@/app/lib/printify/service';

export const runtime = 'nodejs';
export const revalidate = 60;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || '1') || 1;
  const perPage = Number(searchParams.get('per_page') || '100') || 100;
  try {
    const svc = getPrintifyService();
    const result = await svc.getProducts(page, perPage);
    const products = (result.data || []).map((product) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.variants?.[0]?.price ? product.variants[0].price / 100 : 0,
      image: product.images?.[0]?.src || '/assets/placeholder-product.jpg',
      tags: product.tags || [],
      variants:
        product.variants?.map((v) => ({
          id: v.id,
          price: v.price / 100,
          is_enabled: v.is_enabled,
          in_stock: v.is_available,
        })) || [],
      available: product.variants?.some((v) => v.is_enabled && v.is_available) || false,
      visible: product.visible,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    }));
    return NextResponse.json({
      ok: true,
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages: result.last_page,
          total: result.total,
          perPage,
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Printify fetch failed' },
      { status: 502 },
    );
  }
}
