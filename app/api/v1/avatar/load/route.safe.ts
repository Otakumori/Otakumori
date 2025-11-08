import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { generateRequestId } from '../../../../lib/request-id';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    // Log avatar load request
    console.warn('Avatar load requested from:', request.headers.get('user-agent'));

    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Authentication required', requestId },
        { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } },
      );
    }

    // Get user's avatar configuration
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarConfig: true,
        avatarBundle: true,
        avatarRendering: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found', requestId }, { status: 404 });
    }

    // Return avatar data
    const response = {
      ok: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          display_name: user.displayName,
          avatarConfig: user.avatarConfig,
          avatarBundle: user.avatarBundle,
          avatarRendering: user.avatarRendering,
          adultVerified: false, // TODO: Get from Clerk metadata
          lastUpdated: user.updatedAt,
        },
      },
      requestId,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Avatar load error:', error);

    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
        requestId,
      },
      { status: 500 },
    );
  }
}
