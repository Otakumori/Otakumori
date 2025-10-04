import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(' Seeding products...');

  // Basic example product
  const product = await prisma.product.upsert({
    where: { id: 'prod_demo_shirt' },
    update: {
      name: 'Otaku-mori Retro Tee',
      description: 'Soft cotton tee with retro PS2-era vibes.',
      primaryImageUrl: '/images/products/retro-tee.png',
      active: true,
      category: 'apparel',
    },
    create: {
      id: 'prod_demo_shirt',
      name: 'Otaku-mori Retro Tee',
      description: 'Soft cotton tee with retro PS2-era vibes.',
      primaryImageUrl: '/images/products/retro-tee.png',
      active: true,
      category: 'apparel',
    },
  });

  await prisma.productVariant.upsert({
    where: { productId_printifyVariantId: { productId: product.id, printifyVariantId: 1001 } },
    update: { isEnabled: true, inStock: true, priceCents: 2500, currency: 'USD' },
    create: {
      id: 'var_demo_shirt_m',
      productId: product.id,
      printifyVariantId: 1001,
      isEnabled: true,
      inStock: true,
      priceCents: 2500,
      currency: 'USD',
    },
  });

  console.log(' Products seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
