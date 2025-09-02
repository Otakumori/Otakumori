 
 
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { userId  } = await auth();
  if (!userId) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const { displayName } = (await req.json()) as { displayName?: string };

  await prisma.user.update({
    where: { id: userId },
    data: { display_name: displayName ?? null },
  });

  return NextResponse.json({ ok: true });
}
