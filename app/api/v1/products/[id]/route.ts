// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { ProductDetailQuery, ProductDetailResponse } from '@/app/lib/contracts';

async function getPrisma() {
  const { prisma } = await import('@/app/lib/prisma');
  return prisma;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const parsed = ProductDetailQuery.safeParse({ id: params.id });
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid id' }, { status: 400 });
  }

  const prisma = await getPrisma();
  const p = await prisma.product.findUnique({
    where: { id: parsed.data.id },
    include: { ProductVariant: { where: { isEnabled: true } } },
  });
  if (!p) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

  const body = {
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
  };
  const validated = ProductDetailResponse.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ ok: false, error: 'Failed to shape response' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, data: validated.data });
}
