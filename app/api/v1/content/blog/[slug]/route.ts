import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    // Extract query params
    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';
    const includeRelated = searchParams.get('includeRelated') === 'true';
    
    const { slug } = await params;

    // Build query conditionally based on includeRelated
    const queryOptions: any = {
      where: {
        slug,
      },
    };
    
    // Note: includeRelated would add related posts when schema supports it
    // For now, we skip the include to avoid TypeScript errors
    // if (includeRelated) {
    //   queryOptions.include = { relatedPosts: true };
    // }

    const post = await db.contentPage.findUnique(queryOptions);

    if (!post || (!post.published && !preview)) {
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
    logger.error('Blog post API error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to fetch blog post',
      },
      { status: 500 },
    );
  }
}
