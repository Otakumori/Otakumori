 
 
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌸 Seeding shop items...');

  // Sakura Frame
  await prisma.petalShopItem.upsert({
    where: { sku: 'frame.sakura.v1' },
    update: {},
    create: {
      sku: 'frame.sakura.v1',
      name: 'Sakura Frame',
      kind: 'COSMETIC',
      priceRunes: 1,
      pricePetals: 0,
      eventTag: 'SPRING_HANAMI',
      metadata: { preview: '/assets/cosmetics/frames/frame_sakura_v1.png' },
    },
  });

  // Sakura Overlay
  await prisma.petalShopItem.upsert({
    where: { sku: 'overlay.sakura.tint1' },
    update: {},
    create: {
      sku: 'overlay.sakura.tint1',
      name: 'Sakura Tint',
      kind: 'OVERLAY',
      priceRunes: 0,
      pricePetals: 250,
      eventTag: 'SPRING_HANAMI',
      metadata: { preview: '/assets/overlays/overlay_sakura_tint1.png' },
    },
  });

  // Katana Cursor
  await prisma.petalShopItem.upsert({
    where: { sku: 'cursor.katana.v1' },
    update: {},
    create: {
      sku: 'cursor.katana.v1',
      name: 'Katana Cursor',
      kind: 'COSMETIC',
      priceRunes: 3,
      pricePetals: 0,
      metadata: { preview: '/assets/cosmetics/cursors/cursor_katana_v1.png' },
    },
  });

  // Colorful Text Style
  await prisma.petalShopItem.upsert({
    where: { sku: 'textstyle.multicolor.v1' },
    update: {},
    create: {
      sku: 'textstyle.multicolor.v1',
      name: 'Colorful Text (5 uses)',
      kind: 'COSMETIC',
      priceRunes: 0,
      pricePetals: 5, // micro-purchase
      metadata: { preview: '/assets/textstyles/sample_multicolor.png', charges: 5 },
    },
  });

  console.log('✅ Shop items seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding shop:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
