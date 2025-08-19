import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category');
    const published = searchParams.get('published') !== 'false'; // Default to true

    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (published) {
      where.published = true;
    }

    const posts = await db.blogPost.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        title: true,
        excerpt: true,
        slug: true,
        publishedAt: true,
        category: true,
        author: {
          select: {
            username: true,
            display_name: true,
          },
        },
      },
    });

    const total = await db.blogPost.count({ where });

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