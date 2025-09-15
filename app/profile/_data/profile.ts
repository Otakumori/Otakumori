// app/profile/_data/profile.ts
import { prisma } from '@/app/lib/prisma';
import { requireUserId } from '@/app/lib/auth';
import { currentUser } from '@clerk/nextjs/server';

export async function getProfileData() {
  const userId = await requireUserId();
  const user = await currentUser();

  if (!user) {
    throw new Error('User not found');
  }

  // Get user profile data
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: {
      gamertag: true,
      gamertagChangedAt: true,
      bannerKey: true,
    },
  });

  // Get achievements data
  const achievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: {
      achievement: {
        select: {
          code: true,
          points: true,
          name: true,
          description: true,
        },
      },
    },
  });

  const ownedCodes = new Set(achievements.map((a) => a.achievement.code));

  // Calculate cooldown for gamertag changes
  const canRenameAt = profile?.gamertagChangedAt
    ? new Date(profile.gamertagChangedAt.getTime() + 365 * 24 * 60 * 60 * 1000)
    : new Date();

  return {
    user,
    achievements,
    ownedCodes,
    gamertag: profile?.gamertag,
    canRenameAt: canRenameAt > new Date() ? canRenameAt : null,
  };
}
