 
 
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    const { title, reason } = await req.json();
    if (!title) {
      return NextResponse.json({ ok: false, error: 'Missing title' }, { status: 400 });
    }

    // Check if user already has this title
    const existingTitle = await prisma.userTitle.findFirst({
      where: {
        userId,
        title,
      },
    });

    if (existingTitle) {
      return NextResponse.json({ ok: false, error: 'Title already awarded' }, { status: 400 });
    }

    // Award the title
    const newTitle = await prisma.userTitle.create({
      data: {
        userId,
        title,
        awardedAt: new Date(),
      },
    });

    // Log the award in petal ledger if reason is provided
    if (reason) {
      await prisma.petalLedger.create({
        data: {
          userId,
          type: 'earn',
          amount: 0, // No petals for titles, just logging
          reason: `Title awarded: ${title} - ${reason}`,
        },
      });
    }

    return NextResponse.json({ ok: true, title: newTitle });
  } catch (err) {
    console.error('Title award error:', err);
    return NextResponse.json({ ok: false, error: 'AWARD_ERROR' }, { status: 500 });
  }
}
