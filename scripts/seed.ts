#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';
import { env } from '../env.mjs';

const prisma = new PrismaClient();

async function seedPrintifyFallback() {
  const now = new Date();
  const products = [
    {
      id: 'seed-prod-1',
      name: 'Abyss T-Shirt',
      description: 'Soft cotton tee inspired by the abyss.',
      primaryImageUrl: '/placeholder-product.jpg',
      active: true,
      category: 'apparel',
      isNSFW: false,
      integrationRef: 'seed:dev-1',
    },
    {
      id: 'seed-prod-2',
      name: 'Starlit Hoodie',
      description: 'Cozy hoodie with starlit sky print.',
      primaryImageUrl: '/placeholder-product.jpg',
      active: true,
      category: 'apparel',
      isNSFW: false,
      integrationRef: 'seed:dev-2',
    },
    {
      id: 'seed-prod-3',
      name: 'Petal Enamel Pin',
      description: 'Bloom-themed enamel pin.',
      primaryImageUrl: '/placeholder-product.jpg',
      active: true,
      category: 'accessories',
      isNSFW: false,
      integrationRef: 'seed:dev-3',
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        name: p.name,
        description: p.description,
        primaryImageUrl: p.primaryImageUrl,
        active: p.active,
        category: p.category,
        isNSFW: p.isNSFW,
        integrationRef: p.integrationRef,
        createdAt: now,
        updatedAt: now,
        ProductVariant: {
          create: [
            {
              id: `${p.id}-v1`,
              printifyVariantId: 1000,
              // productId: p.id, // This field doesn't exist in ProductVariant model
              inStock: true,
              isEnabled: true,
              priceCents: 2500,
              currency: 'USD',
              previewImageUrl: p.primaryImageUrl,
              printProviderName: 'seed-provider',
              createdAt: now,
              updatedAt: now,
            },
          ],
        },
      },
    });
  }
}

async function trySeedFromPrintify() {
  const apiKey = env.PRINTIFY_API_KEY;
  const shopId = env.PRINTIFY_SHOP_ID;
  if (!apiKey || !shopId) return false;

  try {
    const url = `https://api.printify.com/v1/shops/${shopId}/products.json?page=1&limit=3`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
    if (!res.ok) return false;
    const json: any = await res.json();
    const list = json?.data || [];
    for (const item of list) {
      const pid = `seed-live-${item.id}`;
      await prisma.product.upsert({
        where: { id: pid },
        update: {},
        create: {
          id: pid,
          name: item.title,
          description: item.description || null,
          primaryImageUrl: item?.images?.[0]?.src || '/placeholder-product.jpg',
          active: true,
          category: item?.tags?.[0] || 'other',
          isNSFW: false,
          integrationRef: `seed:printify:${item.id}`,
          ProductVariant: {
            create: (item.variants || []).slice(0, 1).map((v: any, idx: number) => ({
              id: `${pid}-v${idx + 1}`,
              productId: pid,
              printifyVariantId: v.id || 9999,
              inStock: !!v.in_stock,
              isEnabled: !!v.is_enabled,
              priceCents: typeof v.price === 'number' ? v.price : 0,
              currency: 'USD',
              previewImageUrl: item?.images?.[0]?.src || null,
              printProviderName: item?.print_provider_name || 'printify',
            })),
          },
        },
      });
    }
    return true;
  } catch {
    return false;
  }
}

async function upsertDemoUser() {
  // Create a simple demo user with petals and initial scores
  const user = await prisma.user.upsert({
    where: { clerkId: 'seed_test_user' },
    update: {},
    create: {
      id: undefined as any, // let Prisma generate cuid
      email: 'qa+seed@example.com',
      username: 'seed_user',
      clerkId: 'seed_test_user',
      display_name: 'Seed QA',
      avatarUrl: null,
      petalBalance: 500,
    },
  });

  // Petals ledger (+500)
  await prisma.petalLedger.create({
    data: {
      userId: user.id,
      type: 'earn',
      amount: 500,
      reason: 'seed:grant',
    },
  });

  // Leaderboard scores (keep unique by user,game,diff)
  await prisma.leaderboardScore.upsert({
    where: { userId_game_diff: { userId: user.id, game: 'petal-collection', diff: 'normal' } },
    update: { score: 1234 },
    create: { userId: user.id, game: 'petal-collection', diff: 'normal', score: 1234 },
  });
  await prisma.leaderboardScore.upsert({
    where: { userId_game_diff: { userId: user.id, game: 'memory', diff: 'normal' } },
    update: { score: 987 },
    create: { userId: user.id, game: 'memory', diff: 'normal', score: 987 },
  });
}

async function main() {
  // 'Seeding app data...'
  const usedLive = await trySeedFromPrintify();
  if (!usedLive) {
    // 'Printify not available, seeding fallback products.'
    await seedPrintifyFallback();
  } else {
    // 'Seeded from live Printify API.'
  }
  await upsertDemoUser();
  // 'Seed complete.'
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
