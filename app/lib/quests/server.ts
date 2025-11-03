import { PrismaClient } from '@prisma/client';
import seedrandom from 'seedrandom';
import { QUEST_POOL } from './pool';

const prisma = new PrismaClient();

/**
 * Get user's current day in America/New_York timezone
 * This ensures consistent daily quest assignments across timezones
 */
export function userDayNY() {
  const d = new Date(); // server in UTC
  const tz = 'America/New_York';
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(d)
    .replace(
      /(\d+)\/(\d+)\/(\d+)/,
      (_, m, dd, yyyy) => `${yyyy}-${m.padStart(2, '0')}-${dd.padStart(2, '0')}`,
    );
}

/**
 * Ensure daily quest assignments exist for a user
 * Uses deterministic RNG based on userId + day for consistent assignments
 */
export async function ensureDailyAssignments(userId: string, day = userDayNY(), perDay = 3) {
  // deterministic pick based on userId + day; no exclusives
  const rng = seedrandom(`${userId}:${day}`);
  const pool = QUEST_POOL;
  const picks: string[] = [];

  while (picks.length < Math.min(perDay, pool.length)) {
    const i = Math.floor(rng() * pool.length);
    const entry = pool[i];
    if (!entry) continue;
    const { key: k } = entry;
    if (!picks.includes(k)) picks.push(k);
  }

  // upsert Quest rows (ensures they exist)
  for (const def of pool) {
    await prisma.quest.upsert({
      where: { key: def.key },
      update: {
        title: def.title,
        description: def.description,
        kind: def.kind,
        basePetals: def.basePetals,
        bonusPetals: def.bonusPetals,
      },
      create: {
        key: def.key,
        title: def.title,
        description: def.description,
        kind: def.kind,
        basePetals: def.basePetals,
        bonusPetals: def.bonusPetals,
      },
    });
  }

  // create assignments for picked quests
  const quests = await prisma.quest.findMany({ where: { key: { in: picks } } });
  for (const q of quests) {
    const questDef = QUEST_POOL.find((p) => p.key === q.key);
    if (!questDef) {
      continue;
    }

    await prisma.questAssignment.upsert({
      where: {
        userId_questId_day: { userId, questId: q.id, day },
      },
      update: {
        bonusEligible: true,
        target: questDef.target,
      },
      create: {
        userId,
        questId: q.id,
        day,
        target: questDef.target,
        bonusEligible: true,
      },
    });
  }

  return prisma.questAssignment.findMany({
    where: { userId, day },
    include: { Quest: true },
  });
}

/**
 * Get user's quest progress for a specific day
 */
export async function getUserQuests(userId: string, day = userDayNY()) {
  return prisma.questAssignment.findMany({
    where: { userId, day },
    include: { Quest: true },
    orderBy: { day: 'asc' },
  });
}

/**
 * Get user's quest backlog (incomplete quests from previous days)
 */
export async function getUserBacklog(userId: string, limit = 20) {
  return prisma.questAssignment.findMany({
    where: {
      userId,
      day: { lt: userDayNY() },
      completedAt: null,
    },
    include: { Quest: true },
    take: limit,
    orderBy: { day: 'desc' },
  });
}

/**
 * Check if user has earned a streak shard today
 */
export async function hasStreakShardToday(userId: string, day = userDayNY()) {
  const shard = await prisma.streakShard.findFirst({
    where: { userId, day },
  });
  return !!shard;
}

/**
 * Award a streak shard if user hasn't earned one today
 */
export async function awardStreakShardIfEligible(userId: string, day = userDayNY()) {
  const hasShard = await hasStreakShardToday(userId, day);
  if (!hasShard) {
    await prisma.streakShard.create({
      data: { userId, day },
    });
    return true;
  }
  return false;
}
