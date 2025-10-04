import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ' Starting database seed...'

  // Clear existing data (optional - remove in production)
  await prisma.product.deleteMany({});
  await prisma.gameRun.deleteMany({});
  await prisma.achievement.deleteMany({});
  await prisma.reward.deleteMany({});

  // Seed Products
  // ' Seeding products...'
  const products = [
    {
      id: 'prod_cherry_hoodie',
      name: 'Cherry Blossom Hoodie',
      description:
        'Soft, cozy hoodie featuring delicate cherry blossom patterns. Perfect for those who appreciate the beauty of fleeting moments.',
      primaryImageUrl: '/images/seed/cherry-hoodie.png',
      active: true,
      category: 'apparel',
      isNSFW: false,
      categorySlug: 'hoodies',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'prod_abyss_tee',
      name: 'Abyss T-Shirt',
      description:
        'Dark, mysterious design inspired by the depths. For those who dare to explore the unknown.',
      primaryImageUrl: '/images/seed/abyss-tee.png',
      active: true,
      category: 'apparel',
      isNSFW: false,
      categorySlug: 't-shirts',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'prod_rune_pin',
      name: 'Guardian Rune Pin',
      description:
        'Ancient rune pin that channels protective energy. A small token with great power.',
      primaryImageUrl: '/images/seed/rune-pin.png',
      active: true,
      category: 'accessories',
      isNSFW: false,
      categorySlug: 'pins',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'prod_soapstone_mug',
      name: 'Soapstone Mug',
      description:
        'Handcrafted mug with soapstone texture. Perfect for leaving messages or enjoying your morning coffee.',
      primaryImageUrl: '/images/seed/soapstone-mug.png',
      active: true,
      category: 'drinkware',
      isNSFW: false,
      categorySlug: 'mugs',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'prod_petal_hoodie',
      name: 'Petal Samurai Hoodie',
      description:
        'Inspired by the art of petal collection. Features flowing designs that capture the essence of the game.',
      primaryImageUrl: '/images/seed/petal-hoodie.png',
      active: true,
      category: 'apparel',
      isNSFW: false,
      categorySlug: 'hoodies',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'prod_memory_tee',
      name: 'Memory Match T-Shirt',
      description:
        'Clean, minimalist design for those who excel at pattern recognition and memory games.',
      primaryImageUrl: '/images/seed/memory-tee.png',
      active: true,
      category: 'apparel',
      isNSFW: false,
      categorySlug: 't-shirts',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'prod_rhythm_sticker',
      name: 'Rhythm Beat Sticker Pack',
      description:
        'Set of vinyl stickers featuring musical notes and rhythm patterns. Perfect for laptops, water bottles, and more.',
      primaryImageUrl: '/images/seed/rhythm-stickers.png',
      active: true,
      category: 'accessories',
      isNSFW: false,
      categorySlug: 'stickers',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'prod_otakumori_poster',
      name: 'Otakumori Poster',
      description:
        "Beautiful poster featuring the iconic cherry blossom tree and game elements. Perfect for any gamer's room.",
      primaryImageUrl: '/images/seed/otakumori-poster.png',
      active: true,
      category: 'home',
      isNSFW: false,
      categorySlug: 'posters',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      create: product,
      update: product,
    });
  }

  // Create product variants for each product
  // ' Creating product variants...'
  const productVariants = [
    // Cherry Blossom Hoodie variants
    {
      id: 'var_cherry_hoodie_s_black',
      productId: 'prod_cherry_hoodie',
      previewImageUrl: '/images/seed/cherry-hoodie-s-black.png',
      printifyVariantId: 1001,
      printProviderName: 'Gildan',
      leadMinDays: 2,
      leadMaxDays: 5,
      isEnabled: true,
      inStock: true,
      priceCents: 4599,
      currency: 'USD',
    },
    {
      id: 'var_cherry_hoodie_m_black',
      productId: 'prod_cherry_hoodie',
      previewImageUrl: '/images/seed/cherry-hoodie-m-black.png',
      printifyVariantId: 1002,
      printProviderName: 'Gildan',
      leadMinDays: 2,
      leadMaxDays: 5,
      isEnabled: true,
      inStock: true,
      priceCents: 4599,
      currency: 'USD',
    },
    // Abyss T-Shirt variants
    {
      id: 'var_abyss_tee_s_black',
      productId: 'prod_abyss_tee',
      previewImageUrl: '/images/seed/abyss-tee-s-black.png',
      printifyVariantId: 2001,
      printProviderName: 'Bella+Canvas',
      leadMinDays: 1,
      leadMaxDays: 3,
      isEnabled: true,
      inStock: true,
      priceCents: 2499,
      currency: 'USD',
    },
    {
      id: 'var_abyss_tee_m_black',
      productId: 'prod_abyss_tee',
      previewImageUrl: '/images/seed/abyss-tee-m-black.png',
      printifyVariantId: 2002,
      printProviderName: 'Bella+Canvas',
      leadMinDays: 1,
      leadMaxDays: 3,
      isEnabled: true,
      inStock: true,
      priceCents: 2499,
      currency: 'USD',
    },
    // Rune Pin variant
    {
      id: 'var_rune_pin_standard',
      productId: 'prod_rune_pin',
      previewImageUrl: '/images/seed/rune-pin-standard.png',
      printifyVariantId: 3001,
      printProviderName: 'Custom',
      leadMinDays: 3,
      leadMaxDays: 7,
      isEnabled: true,
      inStock: true,
      priceCents: 999,
      currency: 'USD',
    },
    // Soapstone Mug variant
    {
      id: 'var_soapstone_mug_white',
      productId: 'prod_soapstone_mug',
      previewImageUrl: '/images/seed/soapstone-mug-white.png',
      printifyVariantId: 4001,
      printProviderName: 'Custom',
      leadMinDays: 2,
      leadMaxDays: 4,
      isEnabled: true,
      inStock: true,
      priceCents: 1499,
      currency: 'USD',
    },
  ];

  for (const variant of productVariants) {
    await prisma.productVariant.upsert({
      where: { id: variant.id },
      create: variant,
      update: variant,
    });
  }

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
  // `  - ${products.length} products`
  // `  - ${productVariants.length} product variants`
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
