// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { ProductListQuery, ProductListResponse } from '@/app/lib/contracts';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = ProductListQuery.safeParse({
    q: url.searchParams.get('q') ?? undefined,
    category: url.searchParams.get('category') ?? undefined,
    page: url.searchParams.get('page') ?? undefined,
    pageSize: url.searchParams.get('pageSize') ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid query' }, { status: 400 });
  }

  const { q, category, page, pageSize } = parsed.data;
  const skip = (page - 1) * pageSize;

  const where: any = { active: true };
  if (category) where.category = category;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [products, count] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        ProductVariant: { where: { isEnabled: true }, orderBy: { priceCents: 'asc' } },
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);

  const body = {
    items: products.map((p) => ({
      id: p.id,
      title: p.name,
      description: p.description ?? undefined,
      images: p.primaryImageUrl ? [p.primaryImageUrl] : [],
      price:
        p.ProductVariant?.find((v) => v.priceCents != null)?.priceCents != null
          ? (p.ProductVariant.find((v) => v.priceCents != null)!.priceCents as number) / 100
          : 0,
      category: p.category ?? undefined,
      variants: p.ProductVariant,
    })),
    count,
    pageSize,
  };

  const validated = ProductListResponse.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ ok: false, error: 'Failed to shape response' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data: validated.data });
}
