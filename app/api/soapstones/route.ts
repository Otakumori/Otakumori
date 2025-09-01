import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const items = await prisma.soapstone.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json({ items });
  } catch (e) {
    console.error('soapstones:get', e);
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
