import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/lib/db';
import { PresenceUpdateSchema } from '@/app/lib/contracts';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = PresenceUpdateSchema.parse(body);

    // Get current user
    const currentUser = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // Update or create presence
    const presence = await db.presence.upsert({
      where: { profileId: currentUser.id },
      update: {
        status: validatedData.status,
        activity: validatedData.activity || {},
        showActivity: validatedData.showActivity,
        lastSeen: new Date(),
        updatedAt: new Date(),
      },
      create: {
        profileId: currentUser.id,
        status: validatedData.status,
        activity: validatedData.activity || {},
        showActivity: validatedData.showActivity ?? true,
        lastSeen: new Date(),
      },
    });

    return NextResponse.json({ ok: true, data: presence });
  } catch (error) {
    console.error('Presence heartbeat error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ ok: false, error: 'Invalid input data' }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
