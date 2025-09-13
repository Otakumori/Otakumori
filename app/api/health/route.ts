import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'db error' }, { status: 500 });
  }
}