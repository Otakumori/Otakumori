
import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { ProfileUpdateSchema } from '@/app/lib/contracts';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

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
    const updateData: any = {};
    if (validatedData.display_name !== undefined)
      updateData.display_name = validatedData.display_name;
    if (validatedData.bio !== undefined) updateData.bio = validatedData.bio;
    if (validatedData.location !== undefined) updateData.location = validatedData.location;
    if (validatedData.website !== undefined) updateData.website = validatedData.website;
    if (validatedData.bannerUrl !== undefined) updateData.bannerUrl = validatedData.bannerUrl;
    if (validatedData.avatarUrl !== undefined) updateData.avatarUrl = validatedData.avatarUrl;
    if (validatedData.visibility !== undefined) updateData.visibility = validatedData.visibility;
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        displayName: true,
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
    logger.error('Profile update error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ ok: false, error: 'Invalid input data' }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
