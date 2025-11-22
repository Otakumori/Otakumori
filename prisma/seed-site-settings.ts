/**
 * Seed Site Settings
 *
 * Seeds initial site settings matching config/featureFlags.ts defaults.
 * Run this after migrations to ensure defaults are in place.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding site settings...');

  // Default feature flags (matching config/featureFlags.ts defaults)
  const defaultSettings = [
    {
      key: 'AVATARS_ENABLED',
      boolValue: true, // Default: true (enabled)
    },
    {
      key: 'REQUIRE_AUTH_FOR_MINI_GAMES',
      boolValue: false, // Default: false (guests can play)
    },
    {
      key: 'NSFW_AVATARS_ENABLED',
      boolValue: false, // Default: false (NSFW disabled)
    },
  ];

  for (const setting of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      create: {
        key: setting.key,
        boolValue: setting.boolValue,
        updatedBy: 'system',
      },
      update: {
        // Don't overwrite existing values, just ensure they exist
      },
    });
  }

  console.log(`✅ Seeded ${defaultSettings.length} site settings`);
}

main()
  .catch((e) => {
    console.error('Error seeding site settings:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
