import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/app/lib/authz';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    await requireAdmin();
  } catch (error) {
    console.error('Admin auth failed for reviews GET:', error);
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor') ?? undefined;
  const take = Math.min(Number(searchParams.get('take') ?? 20), 100);

  const reviews = await db.productReview.findMany({
    where: { isApproved: false },
    orderBy: { createdAt: 'asc' },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  let nextCursor: string | null = null;
  let items = reviews;

  if (reviews.length > take) {
    const last = reviews.at(-1);
    if (last) {
      nextCursor = last.id;
      items = reviews.slice(0, -1);
    }
  }

  return NextResponse.json({ ok: true, items, nextCursor });
}
