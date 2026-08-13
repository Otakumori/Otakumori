// app/profile/_data/profile.ts
import { prisma } from '@/app/lib/prisma';
import { LocalUserUnavailableError, requireLocalViewer } from '@/app/lib/auth/viewer';
import { currentUser } from '@clerk/nextjs/server';

export async function getProfileData() {
  const viewer = await requireLocalViewer();
  const user = await currentUser();

  if (!user) {
    throw new LocalUserUnavailableError('Clerk identity could not be loaded for profile');
  }

  // Get user profile data
  const profile = await prisma.userProfile.findUnique({
    where: { userId: viewer.localUserId },
    select: {
      gamertag: true,
      gamertagChangedAt: true,
      bannerKey: true,
    },
  });

  // Get achievements data
  const achievements = await prisma.userAchievement.findMany({
    where: { userId: viewer.localUserId },
    include: {
      Achievement: {
        select: {
          code: true,
          points: true,
          name: true,
          description: true,
        },
      },
    },
  });

  const ownedCodes = new Set(achievements.map((a) => a.Achievement.code));

  // Calculate cooldown for gamertag changes
  const canRenameAt = profile?.gamertagChangedAt
    ? new Date(profile.gamertagChangedAt.getTime() + 365 * 24 * 60 * 60 * 1000)
    : new Date();

  return {
    viewer,
    user,
    achievements,
    ownedCodes,
    gamertag: profile?.gamertag,
    canRenameAt: canRenameAt > new Date() ? canRenameAt : null,
  };
}
