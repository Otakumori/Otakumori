import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌸 Seeding Rune System...');

  // Create or update site configuration
  await prisma.siteConfig.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      guestCap: 50,
      burst: {
        enabled: true,
        minCooldownSec: 15,
        maxPerMinute: 3,
        particleCount: {
          small: 20,
          medium: 40,
          large: 80,
        },
        rarityWeights: {
          small: 0.6,
          medium: 0.3,
          large: 0.1,
        },
      },
      tree: {
        sway: 0.5,
        spawnRate: 2000,
        snapPx: 4,
        dither: 0.3,
      },
      theme: {
        pinkIntensity: 1.0,
        grayIntensity: 1.0,
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
        seasonal: {
          multiplier: 1.0,
        },
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
        gacha: { enabled: true },
      },
      updatedAt: new Date(),
      updatedBy: 'system',
    },
  });

  console.log('✅ Site configuration created/updated');

  // Create initial rune definitions
  const runeDefs = [
    {
      id: 'rune_sakura_blossom',
      canonicalId: 'rune_a',
      displayName: 'Sakura Blossom',
      glyph: '🌸',
      lore: 'The first bloom of spring, carrying hope and renewal.',
      printifyUPCs: ['SAKURA001', 'SAKURA002'],
      isActive: true,
    },
    {
      id: 'rune_moonlight',
      canonicalId: 'rune_b',
      displayName: 'Moonlight',
      glyph: '🌙',
      lore: 'Silver light that guides travelers through darkness.',
      printifyUPCs: ['MOON001', 'MOON002'],
      isActive: true,
    },
    {
      id: 'rune_star_fire',
      canonicalId: 'rune_c',
      displayName: 'Star Fire',
      glyph: '⭐',
      lore: 'Burning bright with the passion of a thousand suns.',
      printifyUPCs: ['STAR001', 'STAR002'],
      isActive: true,
    },
    {
      id: 'rune_water_flow',
      canonicalId: 'rune_d',
      displayName: 'Water Flow',
      glyph: '💧',
      lore: 'Adaptable and persistent, finding paths where none exist.',
      printifyUPCs: ['WATER001', 'WATER002'],
      isActive: true,
    },
    {
      id: 'rune_earth_stone',
      canonicalId: 'rune_e',
      displayName: 'Earth Stone',
      glyph: '🪨',
      lore: 'Unmovable foundation, the bedrock of all creation.',
      printifyUPCs: ['EARTH001', 'EARTH002'],
      isActive: true,
    },
    {
      id: 'rune_wind_song',
      canonicalId: 'rune_f',
      displayName: 'Wind Song',
      glyph: '🌪️',
      lore: 'Whispers secrets carried from distant lands.',
      printifyUPCs: ['WIND001', 'WIND002'],
      isActive: true,
    },
    {
      id: 'rune_lightning_bolt',
      canonicalId: 'rune_g',
      displayName: 'Lightning Bolt',
      glyph: '⚡',
      lore: 'Sudden power that illuminates the darkest moments.',
      printifyUPCs: ['LIGHT001', 'LIGHT002'],
      isActive: true,
    },
    {
      id: 'rune_ice_crystal',
      canonicalId: 'rune_h',
      displayName: 'Ice Crystal',
      glyph: '❄️',
      lore: 'Perfect clarity frozen in time, reflecting truth.',
      printifyUPCs: ['ICE001', 'ICE002'],
      isActive: true,
    },
  ];

  for (const runeDef of runeDefs) {
    await prisma.runeDef.upsert({
      where: { id: runeDef.id },
      update: runeDef,
      create: {
        ...runeDef,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  console.log('✅ Rune definitions created/updated');

  // Create initial rune combos
  const runeCombos = [
    {
      id: 'combo_sakura_power',
      comboId: 'sakura_power',
      members: ['rune_a', 'rune_b'],
      revealCopy: 'The Sakura Power combo unlocks enhanced petal generation!',
      cosmeticBurst: 'medium',
      isActive: true,
    },
    {
      id: 'combo_elemental_mastery',
      comboId: 'elemental_mastery',
      members: ['rune_c', 'rune_d', 'rune_e'],
      revealCopy: 'Elemental Mastery grants access to rare seasonal events!',
      cosmeticBurst: 'large',
      isActive: true,
    },
    {
      id: 'combo_nature_harmony',
      comboId: 'nature_harmony',
      members: ['rune_f', 'rune_g', 'rune_h'],
      revealCopy: 'Nature Harmony reveals hidden paths in the petal realm!',
      cosmeticBurst: 'large',
      isActive: true,
    },
    {
      id: 'combo_balance_zen',
      comboId: 'balance_zen',
      members: ['rune_a', 'rune_e', 'rune_h'],
      revealCopy: 'Balance Zen provides daily meditation bonuses!',
      cosmeticBurst: 'medium',
      isActive: true,
    },
  ];

  for (const combo of runeCombos) {
    await prisma.runeCombo.upsert({
      where: { id: combo.id },
      update: combo,
      create: {
        ...combo,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create combo members
    for (const runeId of combo.members) {
      const runeDef = await prisma.runeDef.findUnique({
        where: { canonicalId: runeId },
      });

      if (runeDef) {
        await prisma.runeComboMember.upsert({
          where: {
            comboId_runeId: {
              comboId: combo.id,
              runeId: runeDef.id,
            },
          },
          update: {},
          create: {
            comboId: combo.id,
            runeId: runeDef.id,
          },
        });
      }
    }
  }

  console.log('✅ Rune combos created/updated');

  // Update site config with rune data
  await prisma.siteConfig.update({
    where: { id: 'singleton' },
    data: {
      runes: {
        defs: runeDefs.map(r => r.canonicalId),
        combos: runeCombos.map(c => c.comboId),
        gacha: { enabled: true },
      },
      updatedAt: new Date(),
      updatedBy: 'system',
    },
  });

  console.log('✅ Site configuration updated with rune data');

  console.log('🎉 Rune System seeding completed!');
  console.log(`📊 Created ${runeDefs.length} rune definitions`);
  console.log(`🔗 Created ${runeCombos.length} rune combos`);
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
