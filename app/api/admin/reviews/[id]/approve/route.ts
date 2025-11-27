
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/app/lib/authz';

export const runtime = 'nodejs';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    // admin is { id: string } on success
    console.warn(`Admin ${admin.id} approving review ${params.id}`);
  } catch (error) {
    console.error('Admin auth failed for review approval:', error);
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  await db.productReview.update({
    where: { id: params.id },
    data: { isApproved: true },
  });

  return NextResponse.json({ ok: true });
}
