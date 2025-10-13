// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';

async function getDb() {
  const { db } = await import('@/lib/db');
  return db;
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category');
    console.warn(`Blog posts requested for category: ${category || 'all'}`);
    const published = searchParams.get('published') !== 'false'; // Default to true

    const where: any = {};

    if (published) {
      where.published = true;
    }

    const db = await getDb();
    const posts = await db.contentPage.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        title: true,
        excerpt: true,
        slug: true,
        updatedAt: true,
        published: true,
      },
    });

    const total = await db.contentPage.count({ where });

    return NextResponse.json({
      data: posts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
