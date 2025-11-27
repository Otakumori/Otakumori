import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ' Starting database seed...'

  // Clear existing data (optional - remove in production)
  await prisma.product.deleteMany({});
  await prisma.gameRun.deleteMany({});
  await prisma.achievement.deleteMany({});
  await prisma.reward.deleteMany({});

  // REMOVED: All placeholder products - products should only come from Printify sync

  // Seed Achievements
  // ' Seeding achievements...'
  const achievements = [
    {
      id: 'ach_first_petal',
      code: 'first_petal',
      name: 'First Petal',
      description: 'Collected your first petal',
      points: 10,
    },
    {
      id: 'ach_petal_master',
      code: 'petal_master',
      name: 'Petal Master',
      description: 'Collected 1000 petals',
      points: 100,
    },
    {
      id: 'ach_memory_champion',
      code: 'memory_champion',
      name: 'Memory Champion',
      description: 'Completed Memory Match with perfect score',
      points: 50,
    },
    {
      id: 'ach_rhythm_legend',
      code: 'rhythm_legend',
      name: 'Rhythm Legend',
      description: 'Achieved perfect rhythm in Rhythm Beat',
      points: 75,
    },
    {
      id: 'ach_soapstone_poet',
      code: 'soapstone_poet',
      name: 'Soapstone Poet',
      description: 'Left 10 meaningful soapstone messages',
      points: 25,
    },
    {
      id: 'ach_shop_explorer',
      code: 'shop_explorer',
      name: 'Shop Explorer',
      description: 'Viewed all product categories',
      points: 15,
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { id: achievement.id },
      create: achievement,
      update: achievement,
    });
  }

  // Seed Rewards
  // ' Seeding rewards...'
  const rewards = [
    {
      id: 'reward_petal_bonus_100',
      kind: 'PETALS_BONUS' as const,
      sku: 'petal_bonus_100',
      value: 100,
      metadata: { description: '100 bonus petals' },
    },
    {
      id: 'reward_cosmetic_glow',
      kind: 'COSMETIC' as const,
      sku: 'cursor_glow',
      value: null,
      metadata: { description: 'Cursor glow effect', type: 'cosmetic' },
    },
    {
      id: 'reward_overlay_petals',
      kind: 'OVERLAY' as const,
      sku: 'petal_overlay',
      value: null,
      metadata: { description: 'Petal overlay effect', type: 'overlay' },
    },
  ];

  for (const reward of rewards) {
    await prisma.reward.upsert({
      where: { id: reward.id },
      create: reward,
      update: reward,
    });
  }

  // Seed Site Config
  // ' Seeding site configuration...'
  await prisma.siteConfig.upsert({
    where: { id: 'singleton' },
    create: {
      id: 'singleton',
      guestCap: 50,
      burst: {
        enabled: true,
        minCooldownSec: 15,
        maxPerMinute: 3,
        particleCount: { small: 20, medium: 40, large: 80 },
        rarityWeights: { small: 0.6, medium: 0.3, large: 0.1 },
      },
      tree: {
        sway: 0.5,
        spawnRate: 2000,
        snapPx: 4,
        dither: 0.3,
      },
      theme: {
        pinkIntensity: 0.7,
        grayIntensity: 0.8,
        motionIntensity: 2,
      },
      seasonal: {
        sakuraBoost: false,
        springMode: false,
        autumnMode: false,
      },
      rewards: {
        baseRateCents: 300,
        minPerOrder: 5,
        maxPerOrder: 120,
        streak: {
          enabled: true,
          dailyBonusPct: 0.05,
          maxPct: 0.25,
        },
        seasonal: { multiplier: 1.0 },
        daily: {
          softCap: 200,
          postSoftRatePct: 0.5,
          hardCap: 400,
        },
        firstPurchaseBonus: 20,
      },
      runes: {
        defs: [],
        combos: [],
        gacha: { enabled: false },
      },
      updatedAt: new Date(),
    },
    update: {
      updatedAt: new Date(),
    },
  });

  // ' Database seed completed successfully!'
  // ` Seeded:`
  // `  - ${achievements.length} achievements`
  // `  - ${rewards.length} rewards`
  // `  - 1 site configuration`
}

main()
  .catch((e) => {
    console.error(' Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
