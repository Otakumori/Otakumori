import { PrismaClient } from '@prisma/client';
import { AuthenticationRequiredError, requireLocalViewer } from '@/app/lib/auth/viewer';

const db = new PrismaClient();

export async function loadAchievementsForProfile() {
  let localUserId: string | null = null;
  try {
    ({ localUserId } = await requireLocalViewer());
  } catch (error) {
    if (!(error instanceof AuthenticationRequiredError)) throw error;
  }
  const catalog = await db.achievement.findMany({ orderBy: { id: 'asc' } }).catch(() => []);
  const owned = localUserId
    ? await db.userAchievement
        .findMany({
          where: { userId: localUserId },
          include: { Achievement: { select: { code: true, points: true } } },
        })
        .catch(() => [])
    : [];
  const ownedSet = new Set(owned.map((o) => o.Achievement.code));
  const totalPoints = catalog.reduce((s, a) => s + (a.points ?? 0), 0);
  const earnedPoints = owned.reduce((s, o) => s + (o.Achievement.points ?? 0), 0);
  return { catalog, ownedSet, earnedPoints, totalPoints };
}
