#!/usr/bin/env tsx
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { db } from '@/app/lib/db';

async function checkProducts() {
    try {
        const allProducts = await db.product.findMany({
            where: { active: true },
            select: {
                id: true,
                name: true,
                visible: true,
                active: true,
                primaryImageUrl: true,
                printifyProductId: true,
                ProductImage: {
                    select: { url: true },
                    take: 1,
                },
            },
            orderBy: { updatedAt: 'desc' },
        });

        console.log(`\n📦 Total active products in DB: ${allProducts.length}\n`);

        const withImages = allProducts.filter(
            (p) => p.primaryImageUrl || (p.ProductImage && p.ProductImage.length > 0),
        );
        const visible = allProducts.filter((p) => p.visible);
        const visibleWithImages = allProducts.filter(
            (p) => p.visible && (p.primaryImageUrl || (p.ProductImage && p.ProductImage.length > 0)),
        );

        console.log(`✅ Products with images: ${withImages.length}`);
        console.log(`👁️  Visible products: ${visible.length}`);
        console.log(`✨ Visible products with images: ${visibleWithImages.length}\n`);

        console.log('📋 Product List:\n');
        allProducts.forEach((p, i) => {
            const hasImage = !!(p.primaryImageUrl || (p.ProductImage && p.ProductImage.length > 0));
            const status = p.visible && p.active ? '✓' : p.active ? '⚠️' : '❌';
            console.log(
                `${i + 1}. ${status} ${p.name || 'Unnamed'}\n   ID: ${p.id}\n   Printify ID: ${p.printifyProductId}\n   Visible: ${p.visible}, Active: ${p.active}, Has Image: ${hasImage}\n`,
            );
        });

        await db.$disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkProducts();

