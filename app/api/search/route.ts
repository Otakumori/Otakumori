export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { parseQuery } from '@/lib/search/parse';
import { isCategory } from '@/lib/categories';
import { db } from '@/app/lib/db';

/**
 * Search API route
 * Handles both category redirects (cat:<slug>) and regular product search
 */

const SearchQuerySchema = z.object({
  q: z.string().min(1).max(100),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20)),
  sort: z
    .enum(['newest', 'price_low', 'price_high', 'name', 'relevance'])
    .optional()
    .default('relevance'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Parse the search query
    const parsed = parseQuery(query);

    // If category directive, redirect to category page
    if (parsed.category && isCategory(parsed.category)) {
      return NextResponse.json({
        redirect: `/shop/c/${parsed.category}`,
        type: 'category_redirect',
      });
    }

    // Validate search parameters
    const validatedParams = SearchQuerySchema.parse({
      q: parsed.text || query,
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sort: searchParams.get('sort'),
    });

    const { page, limit, sort } = validatedParams;
    const searchText = validatedParams.q;

    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build search query with Prisma
    const whereClause: any = {
      active: true,
    };

    // Text search across name and description
    if (searchText) {
      whereClause.OR = [
        { name: { contains: searchText, mode: 'insensitive' as const } },
        { description: { contains: searchText, mode: 'insensitive' as const } },
      ];
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (sort) {
      case 'price_low':
        orderBy = { ProductVariant: { priceCents: 'asc' } };
        break;
      case 'price_high':
        orderBy = { ProductVariant: { priceCents: 'desc' } };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'relevance':
      default:
        orderBy = { name: 'asc' };
        break;
    }

    // Execute query with pagination
    const [products, totalCount] = await Promise.all([
      db.product.findMany({
        where: whereClause,
        orderBy,
        skip: from,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          primaryImageUrl: true,
          active: true,
          categorySlug: true,
          createdAt: true,
          updatedAt: true,
          ProductVariant: {
            select: {
              priceCents: true,
            },
            take: 1,
          },
        },
      }),
      db.product.count({ where: whereClause }),
    ]);

    // Transform products
    const transformedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: (product.ProductVariant[0]?.priceCents || 0) / 100,
      imageUrl: product.primaryImageUrl || '',
      slug: product.id, // Using ID as slug for now
      categorySlug: product.categorySlug,
      active: product.active,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      query: {
        original: query,
        parsed: parsed,
        searchText: searchText,
        sort,
      },
    });
  } catch (error) {
    console.error('Search API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
