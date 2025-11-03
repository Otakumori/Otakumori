import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const db = new PrismaClient();

export async function loadAchievementsForProfile() {
  const { userId } = await auth();
  const catalog = await db.achievement.findMany({ orderBy: { id: 'asc' } }).catch(() => []);
  const owned = userId
    ? await db.userAchievement
        .findMany({
          where: { userId },
          include: { Achievement: { select: { code: true, points: true } } },
        })
        .catch(() => [])
    : [];
  const ownedSet = new Set(owned.map((o) => o.Achievement.code));
  const totalPoints = catalog.reduce((s, a) => s + (a.points ?? 0), 0);
  const earnedPoints = owned.reduce((s, o) => s + (o.Achievement.points ?? 0), 0);
  return { catalog, ownedSet, earnedPoints, totalPoints };
}
