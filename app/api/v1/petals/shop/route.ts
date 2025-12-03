
export const dynamic = 'force-dynamic'; // tells Next this cannot be statically analyzed
export const runtime = 'nodejs'; // keep on Node runtime (not edge)
export const preferredRegion = 'iad1'; // optional: co-locate w/ your logs region
export const maxDuration = 10; // optional guard

import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';

const ShopItemResponseSchema = z.object({
  ok: z.boolean(),
  data: z
    .object({
      items: z.array(
        z.object({
          id: z.string(),
          sku: z.string(),
          name: z.string(),
          kind: z.string(), // Changed from enum to string to match schema
          pricePetals: z.number().nullable(), // Made nullable to match schema
          eventTag: z.string().nullable(),
          metadata: z.record(z.string(), z.any()).nullable(),
          createdAt: z.string(),
          updatedAt: z.string(),
        }),
      ),
      total: z.number(),
    })
    .optional(),
  error: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const whereClause: any = {};
    if (category && category !== 'all') {
      whereClause.kind = category.toUpperCase();
    }

    // Get shop items
    const [items, total] = await Promise.all([
      prisma.petalShopItem.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.petalShopItem.count({ where: whereClause }),
    ]);

    // Transform items to match response schema
    const transformedItems = items.map((item: any) => ({
      id: item.id,
      sku: item.sku,
      name: item.name,
      kind: item.kind,
      pricePetals: item.pricePetals,
      eventTag: item.eventTag,
      metadata: item.metadata,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));

    const response = {
      ok: true,
      data: {
        items: transformedItems,
        total,
      },
    };

    // Validate response with Zod schema
    const validatedResponse = ShopItemResponseSchema.parse(response);

    return NextResponse.json(validatedResponse);
  } catch (error) {
    logger.error('Error fetching shop items:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
