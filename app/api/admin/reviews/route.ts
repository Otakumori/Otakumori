// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/app/lib/authz';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin();
    // admin is { id: string } on success
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor') || undefined;
  const take = Math.min(Number(searchParams.get('take') || 20), 100);

  const reviews = await db.productReview.findMany({
    where: { isApproved: false },
    orderBy: { createdAt: 'asc' },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const nextCursor = reviews.length > take ? reviews[reviews.length - 1].id : null;
  const items = nextCursor ? reviews.slice(0, -1) : reviews;

  return NextResponse.json({ ok: true, items, nextCursor });
}
