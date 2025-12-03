
import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { ProfileViewSchema } from '../../../../lib/contracts';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    const { userId } = await auth();
    const { username } = params;

    if (!username) {
      return NextResponse.json({ ok: false, error: 'Username is required' }, { status: 400 });
    }

    // Get the profile user
    const profileUser = await db.user.findUnique({
      where: { username },
      include: {
        ProfileSection: {
          orderBy: { orderIdx: 'asc' },
        },
        ProfileLink: {
          orderBy: { orderIdx: 'asc' },
        },
        ProfileTheme: true,
        Presence: true,
        _count: {
          select: {
            Follow_Follow_followeeIdToUser: true,
            Follow_Follow_followerIdToUser: true,
          },
        },
      },
    });

    if (!profileUser) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // Check if viewer is blocked
    if (userId) {
      const isBlocked = await db.block.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId: profileUser.id,
            blockedId: userId,
          },
        },
      });

      if (isBlocked) {
        return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
      }
    }

    // Check if viewer is blocked by profile user
    if (userId) {
      const isBlockedBy = await db.block.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId: userId,
            blockedId: profileUser.id,
          },
        },
      });

      if (isBlockedBy) {
        return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
      }
    }

    // Check visibility permissions
    let canView = true;
    let isFollowing = false;

    if (profileUser.visibility === 'PRIVATE') {
      canView = false;
    } else if (profileUser.visibility === 'FRIENDS') {
      if (!userId) {
        canView = false;
      } else {
        // Get current user's ID from Clerk ID
        const currentUser = await db.user.findUnique({
          where: { clerkId: userId },
          select: { id: true },
        });

        if (!currentUser) {
          canView = false;
        } else {
          // Check if they're mutual followers (friends)
          const mutualFollow = await db.follow.findUnique({
            where: {
              followerId_followeeId: {
                followerId: currentUser.id,
                followeeId: profileUser.id,
              },
            },
          });

          const mutualFollowBack = await db.follow.findUnique({
            where: {
              followerId_followeeId: {
                followerId: profileUser.id,
                followeeId: currentUser.id,
              },
            },
          });

          canView = !!(mutualFollow && mutualFollowBack);
          isFollowing = !!mutualFollow;
        }
      }
    } else {
      // Public profile
      if (userId) {
        const currentUser = await db.user.findUnique({
          where: { clerkId: userId },
          select: { id: true },
        });

        if (currentUser) {
          const follow = await db.follow.findUnique({
            where: {
              followerId_followeeId: {
                followerId: currentUser.id,
                followeeId: profileUser.id,
              },
            },
          });
          isFollowing = !!follow;
        }
      }
    }

    if (!canView) {
      return NextResponse.json({ ok: false, error: 'Profile is private' }, { status: 403 });
    }

    // Build response
    const profileData = {
      id: profileUser.id,
      username: profileUser.username,
      displayName: profileUser.displayName,
      bio: profileUser.bio,
      location: profileUser.location,
      website: profileUser.website,
      avatarUrl: profileUser.avatarUrl,
      bannerUrl: profileUser.bannerUrl,
      visibility: profileUser.visibility,
      isFollowing,
      isBlocked: false, // We already checked blocks above
      followerCount: profileUser._count.Follow_Follow_followeeIdToUser,
      followingCount: profileUser._count.Follow_Follow_followerIdToUser,
      sections: profileUser.ProfileSection.map((section: any) => ({
        id: section.id,
        code: section.code,
        orderIdx: section.orderIdx,
        visible: section.visible,
      })),
      links: profileUser.ProfileLink.map((link: any) => ({
        id: link.id,
        label: link.label,
        url: link.url,
        orderIdx: link.orderIdx,
      })),
      theme: profileUser.ProfileTheme
        ? {
            themeCode: profileUser.ProfileTheme.themeCode,
            accentHex: profileUser.ProfileTheme.accentHex,
          }
        : undefined,
      presence: profileUser.Presence
        ? {
            profileId: profileUser.Presence.profileId,
            status: profileUser.Presence.status,
            lastSeen: profileUser.Presence.lastSeen.toISOString(),
            activity: profileUser.Presence.activity as any,
            showActivity: profileUser.Presence.showActivity,
          }
        : undefined,
      createdAt: profileUser.createdAt.toISOString(),
    };

    // Validate response
    const validatedData = ProfileViewSchema.parse(profileData);

    return NextResponse.json({ ok: true, data: validatedData });
  } catch (error) {
    logger.error('Profile fetch error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
