import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.petalShopItem.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.userAchievement.deleteMany();

  // Seed Petal Shop Items
  const shopItems = [
    // Frames
    {
      sku: 'frame.sakura',
      name: 'Sakura Frame',
      kind: 'COSMETIC',
      pricePetals: 50,
      priceRunes: null,
      eventTag: 'SPRING_HANAMI',
      visibleFrom: null,
      visibleTo: null,
      metadata: {
        description: 'Beautiful cherry blossom frame for your profile',
        type: 'FRAME',
        rarity: 'RARE',
        imageUrl: '/assets/ui/frames/sakura.png',
      },
    },
    {
      sku: 'frame.neon',
      name: 'Neon Frame',
      kind: 'COSMETIC',
      pricePetals: 75,
      priceRunes: null,
      eventTag: null,
      visibleFrom: null,
      visibleTo: null,
      metadata: {
        description: 'Cyberpunk-style neon border',
        type: 'FRAME',
        rarity: 'LEGENDARY',
        imageUrl: '/assets/ui/frames/neon.png',
      },
    },
    {
      sku: 'frame.classic',
      name: 'Classic Frame',
      kind: 'COSMETIC',
      pricePetals: 25,
      priceRunes: null,
      eventTag: null,
      visibleFrom: null,
      visibleTo: null,
      metadata: {
        description: 'Timeless elegant border',
        type: 'FRAME',
        rarity: 'COMMON',
        imageUrl: '/assets/ui/frames/classic.png',
      },
    },

    // Overlays
    {
      sku: 'overlay.ember',
      name: 'Ember Glow',
      kind: 'OVERLAY',
      pricePetals: 100,
      priceRunes: null,
      eventTag: null,
      visibleFrom: null,
      visibleTo: null,
      metadata: {
        description: 'Warm fire-like overlay effect',
        type: 'OVERLAY',
        rarity: 'LEGENDARY',
        imageUrl: '/assets/ui/overlays/ember.png',
      },
    },
    {
      sku: 'overlay.sparkle',
      name: 'Sparkle Magic',
      kind: 'OVERLAY',
      pricePetals: 60,
      priceRunes: null,
      eventTag: null,
      visibleFrom: null,
      visibleTo: null,
      metadata: {
        description: 'Magical sparkle effects',
        type: 'OVERLAY',
        rarity: 'RARE',
        imageUrl: '/assets/ui/overlays/sparkle.png',
      },
    },
    {
      sku: 'overlay.rainbow',
      name: 'Rainbow Aura',
      kind: 'OVERLAY',
      pricePetals: 80,
      priceRunes: null,
      eventTag: 'PRIDE_MONTH',
      visibleFrom: null,
      visibleTo: null,
      metadata: {
        description: 'Colorful rainbow aura effect',
        type: 'OVERLAY',
        rarity: 'RARE',
        imageUrl: '/assets/ui/overlays/rainbow.png',
      },
    },

    // Text Styles
    {
      sku: 'textstyle.colorful',
      name: 'Colorful Text',
      kind: 'TEXT',
      pricePetals: 120,
      priceRunes: null,
      eventTag: null,
      visibleFrom: null,
      visibleTo: null,
      metadata: {
        description: 'Vibrant rainbow text effects',
        type: 'TEXT_STYLE',
        rarity: 'LEGENDARY',
      },
    },
    {
      sku: 'textstyle.neon',
      name: 'Neon Text',
      kind: 'TEXT',
      pricePetals: 90,
      priceRunes: null,
      eventTag: null,
      visibleFrom: null,
      visibleTo: null,
      metadata: {
        description: 'Glowing neon text style',
        type: 'TEXT_STYLE',
        rarity: 'RARE',
      },
    },
    {
      sku: 'textstyle.glow',
      name: 'Glow Text',
      kind: 'TEXT',
      pricePetals: 60,
      priceRunes: null,
      eventTag: null,
      visibleFrom: null,
      visibleTo: null,
      metadata: {
        description: 'Soft glowing text effect',
        type: 'TEXT_STYLE',
        rarity: 'RARE',
      },
    },

    // Cursors
    {
      sku: 'cursor.anime-eyes',
      name: 'Anime Eyes Cursor',
      kind: 'CURSOR',
      pricePetals: 40,
      priceRunes: null,
      eventTag: null,
      visibleFrom: null,
      visibleTo: null,
      metadata: {
        description: 'Cute anime eyes cursor',
        type: 'CURSOR',
        rarity: 'COMMON',
        imageUrl: '/assets/ui/cursors/anime-eyes.png',
      },
    },
    {
      sku: 'cursor.sword',
      name: 'Sword Cursor',
      kind: 'CURSOR',
      pricePetals: 75,
      priceRunes: null,
      eventTag: null,
      visibleFrom: null,
      visibleTo: null,
      metadata: {
        description: 'Epic sword cursor',
        type: 'CURSOR',
        rarity: 'RARE',
        imageUrl: '/assets/ui/cursors/sword.png',
      },
    },
  ];

  for (const item of shopItems) {
    await prisma.petalShopItem.create({
      data: item,
    });
  }

  console.log(`✅ Created ${shopItems.length} petal shop items`);

  // Seed Achievements
  const achievements = [
    {
      code: 'FIRST_VICTORY',
      name: 'First Steps',
      description: 'Win your first mini-game',
      points: 10,
    },
    {
      code: 'PETAL_COLLECTOR',
      name: 'Petal Collector',
      description: 'Collect 100 petals',
      points: 25,
    },
    {
      code: 'GAME_MASTER',
      name: 'Game Master',
      description: 'Win 10 mini-games',
      points: 50,
    },
    {
      code: 'ACHIEVEMENT_HUNTER',
      name: 'Achievement Hunter',
      description: 'Unlock 5 achievements',
      points: 30,
    },
    {
      code: 'SHOP_SPENDER',
      name: 'Shop Spender',
      description: 'Purchase your first cosmetic',
      points: 15,
    },
    {
      code: 'SPECIAL_SAMURAI',
      name: 'Special Samurai',
      description: 'Achieve perfect score in Samurai Slice',
      points: 100,
    },
    {
      code: 'MEMORY_MASTER',
      name: 'Memory Master',
      description: 'Complete Memory Match in under 30 seconds',
      points: 75,
    },
    {
      code: 'BUBBLE_POPPER',
      name: 'Bubble Popper',
      description: 'Pop 100 bubbles in one session',
      points: 40,
    },
    {
      code: 'RHYTHM_KING',
      name: 'Rhythm King',
      description: 'Achieve 95% accuracy in Rhythm Beat-Em-Up',
      points: 80,
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.create({
      data: achievement,
    });
  }

  console.log(`✅ Created ${achievements.length} achievements`);

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
