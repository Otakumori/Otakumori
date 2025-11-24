#!/usr/bin/env tsx
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { db } from '@/app/lib/db';
import { type Prisma } from '@prisma/client';

async function debugQuery() {
  try {
    // Test the exact WHERE clause from the API
    const where: Prisma.ProductWhereInput = {
      active: true,
      NOT: [
        {
          integrationRef: {
            startsWith: 'seed:',
          },
        },
        {
          name: {
            contains: '[test]',
            mode: 'insensitive',
          },
        },
        {
          name: {
            contains: '[draft]',
            mode: 'insensitive',
          },
        },
        {
          name: {
            contains: '[placeholder]',
            mode: 'insensitive',
          },
        },
      ],
    };

    const products = await db.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        integrationRef: true,
        active: true,
        visible: true,
      },
      take: 20,
    });

    console.log(`\n📊 Products matching WHERE clause: ${products.length}\n`);
    products.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   integrationRef: ${p.integrationRef || 'null'}`);
      console.log(`   active: ${p.active}, visible: ${p.visible}\n`);
    });

    await db.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugQuery();

