// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';

export async function GET() {
  try {
    const items = await db.soapstoneMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json({ items });
  } catch (e) {
    console.error('soapstones:get', e);
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
