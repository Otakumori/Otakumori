import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/app/lib/db';
import { logger } from '@/app/lib/logger';
import {
  generateRequestId,
  createApiSuccess,
  createApiError,
} from '@/app/lib/api-contracts';

export const runtime = 'nodejs';

const QuerySchema = z.object({
  q: z.string().min(1).max(100),
});

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const { searchParams } = new URL(request.url);
    const parsed = QuerySchema.safeParse({
      q: searchParams.get('q') || '',
    });

    if (!parsed.success) {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'Invalid query', requestId),
        { status: 400 },
      );
    }

    const { q } = parsed.data;
    const query = q.trim().toLowerCase();

    // Get suggestions from products, games, and blog posts
    const [products, posts] = await Promise.all([
      db.product.findMany({
        where: {
          active: true,
          visible: true,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { tags: { hasSome: [query] } },
          ],
        },
        select: { name: true },
        take: 3,
      }),
      db.contentPage.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { slug: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: { title: true },
        take: 2,
      }),
    ]);

    const suggestions = [
      ...products.map((p) => p.name),
      ...posts.map((p) => p.title),
    ].slice(0, 5);

    return NextResponse.json(
      createApiSuccess({ suggestions }, requestId),
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      },
    );
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(
      'Search suggestions error',
      { requestId, route: '/api/v1/search/suggestions' },
      undefined,
      err,
    );
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to fetch suggestions', requestId),
      { status: 500 },
    );
  }
}
