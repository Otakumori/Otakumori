import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const post = await db.contentPage.findUnique({
      where: {
        slug,
      },
    });

    if (!post || !post.published) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Blog post not found',
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        post: {
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || undefined,
          content: post.body || undefined,
          publishedAt: post.createdAt.toISOString(),
        },
      },
      source: 'prisma',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Blog post API error:', error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to fetch blog post',
      },
      { status: 500 },
    );
  }
}
