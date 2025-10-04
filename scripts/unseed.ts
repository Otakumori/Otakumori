#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 'Unseeding app data...'

  // Remove seeded products by integrationRef prefix
  const seededProducts = await prisma.product.findMany({
    where: { integrationRef: { startsWith: 'seed:' } },
    select: { id: true },
  });
  for (const p of seededProducts) {
    await prisma.product.delete({ where: { id: p.id } });
  }

  // Remove demo user and related data
  const user = await prisma.user.findUnique({ where: { clerkId: 'seed_test_user' } });
  if (user) {
    await prisma.leaderboardScore.deleteMany({ where: { userId: user.id } });
    await prisma.petalLedger.deleteMany({ where: { userId: user.id } });
    await prisma.order.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  }

  // 'Unseed complete.'
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
