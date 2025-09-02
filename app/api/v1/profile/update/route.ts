import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/lib/db';
import { ProfileUpdateSchema } from '@/app/lib/contracts';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { userId  } = await auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = ProfileUpdateSchema.parse(body);

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // Update user profile
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        display_name: validatedData.display_name,
        bio: validatedData.bio,
        location: validatedData.location,
        website: validatedData.website,
        bannerUrl: validatedData.bannerUrl,
        avatarUrl: validatedData.avatarUrl,
        visibility: validatedData.visibility,
      },
      select: {
        id: true,
        username: true,
        display_name: true,
        bio: true,
        location: true,
        website: true,
        bannerUrl: true,
        avatarUrl: true,
        visibility: true,
      },
    });

    return NextResponse.json({ ok: true, data: updatedUser });
  } catch (error) {
    console.error('Profile update error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ ok: false, error: 'Invalid input data' }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
