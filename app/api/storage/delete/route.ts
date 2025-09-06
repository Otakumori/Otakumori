// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { del } from '@vercel/blob';
import { prisma } from '@/app/lib/prisma';

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    const { key } = await req.json();
    if (!key) {
      return NextResponse.json({ ok: false, error: 'Missing key' }, { status: 400 });
    }

    const file = await prisma.userFile.findUnique({ where: { key } });
    if (!file || file.userId !== userId) {
      return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });
    }

    await prisma.userFile.delete({ where: { key } });
    await del(key);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('delete error', err);
    return NextResponse.json({ ok: false, error: 'DELETE_ERROR' }, { status: 500 });
  }
}
