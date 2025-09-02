import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/lib/db';
import { ProfileViewSchema } from '@/app/lib/contracts';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    const { userId  } = await auth();
    const { username } = params;

    if (!username) {
      return NextResponse.json({ ok: false, error: 'Username is required' }, { status: 400 });
    }

    // Get the profile user
    const profileUser = await db.user.findUnique({
      where: { username },
      include: {
        profileSections: {
          orderBy: { orderIdx: 'asc' },
        },
        profileLinks: {
          orderBy: { orderIdx: 'asc' },
        },
        profileTheme: true,
        presence: true,
        _count: {
          select: {
            followers: true,
            following: true,
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

    if (profileUser.visibility === 'private') {
      canView = false;
    } else if (profileUser.visibility === 'friends') {
      if (!userId) {
        canView = false;
      } else {
        // Check if they're mutual followers (friends)
        const mutualFollow = await db.follow.findUnique({
          where: {
            followerId_followeeId: {
              followerId: userId,
              followeeId: profileUser.id,
            },
          },
        });

        const mutualFollowBack = await db.follow.findUnique({
          where: {
            followerId_followeeId: {
              followerId: profileUser.id,
              followeeId: userId,
            },
          },
        });

        canView = !!(mutualFollow && mutualFollowBack);
        isFollowing = !!mutualFollow;
      }
    } else {
      // Public profile
      if (userId) {
        const follow = await db.follow.findUnique({
          where: {
            followerId_followeeId: {
              followerId: userId,
              followeeId: profileUser.id,
            },
          },
        });
        isFollowing = !!follow;
      }
    }

    if (!canView) {
      return NextResponse.json({ ok: false, error: 'Profile is private' }, { status: 403 });
    }

    // Build response
    const profileData = {
      id: profileUser.id,
      username: profileUser.username,
      display_name: profileUser.display_name,
      bio: profileUser.bio,
      location: profileUser.location,
      website: profileUser.website,
      avatarUrl: profileUser.avatarUrl,
      bannerUrl: profileUser.bannerUrl,
      visibility: profileUser.visibility,
      isFollowing,
      isBlocked: false, // We already checked blocks above
      followerCount: profileUser._count.followers,
      followingCount: profileUser._count.following,
      sections: profileUser.profileSections.map((section) => ({
        id: section.id,
        code: section.code,
        orderIdx: section.orderIdx,
        visible: section.visible,
      })),
      links: profileUser.profileLinks.map((link) => ({
        id: link.id,
        label: link.label,
        url: link.url,
        orderIdx: link.orderIdx,
      })),
      theme: profileUser.profileTheme
        ? {
            themeCode: profileUser.profileTheme.themeCode,
            accentHex: profileUser.profileTheme.accentHex,
          }
        : undefined,
      presence: profileUser.presence
        ? {
            profileId: profileUser.presence.profileId,
            status: profileUser.presence.status,
            lastSeen: profileUser.presence.lastSeen.toISOString(),
            activity: profileUser.presence.activity as any,
            showActivity: profileUser.presence.showActivity,
          }
        : undefined,
      createdAt: profileUser.createdAt.toISOString(),
    };

    // Validate response
    const validatedData = ProfileViewSchema.parse(profileData);

    return NextResponse.json({ ok: true, data: validatedData });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
