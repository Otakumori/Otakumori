// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

async function getDb() {
  const { db } = await import('@/app/lib/db');
  return db;
}

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const { displayName } = (await req.json()) as { displayName?: string };
  const db = await getDb();

  await db.user.update({
    where: { id: userId },
    data: { displayName: displayName ?? null },
  });

  return NextResponse.json({ ok: true });
}
