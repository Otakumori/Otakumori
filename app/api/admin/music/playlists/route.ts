 
 
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { requireAdmin } from '@/app/lib/authz';

export const runtime = 'nodejs';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ ok: false }, { status: admin.status });

  const data = await prisma.musicPlaylist.findMany({
    orderBy: { createdAt: 'desc' },
    include: { tracks: { orderBy: { sort: 'asc' } } },
  });
  return NextResponse.json({ ok: true, data });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ ok: false }, { status: admin.status });

  const { name, isPublic = true } = await req.json();
  const { userId } = auth();
  if (!name || !userId)
    return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });

  const pl = await prisma.musicPlaylist.create({
    data: { name, isPublic, createdBy: userId },
  });
  return NextResponse.json({ ok: true, playlist: pl });
}
