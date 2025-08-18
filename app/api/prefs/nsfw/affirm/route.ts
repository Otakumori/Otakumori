import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/prisma';

export async function POST() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ ok: true }); // guest: ignore
    }

    await prisma.user.update({ 
      where: { clerkId: userId }, 
      data: { 
        nsfwAffirmedAt: new Date(),
        nsfwAffirmationVer: { increment: 1 }
      } 
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('NSFW affirmation error:', error);
    return NextResponse.json({ ok: false, error: 'AFFIRMATION_ERROR' }, { status: 500 });
  }
}
