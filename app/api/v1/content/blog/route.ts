import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSanityClient, isSanityConfigured } from '@/lib/sanity/client';
import {
  latestStoriesQuery,
  latestStoriesCountQuery,
  mapSanityStory,
  type SanityStory,
  type RawSanityStory,
} from '@/lib/sanity/queries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const QuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),
});

function mapStoryToApi(story: SanityStory) {
  return {
    id: story.id,
    type: story.type,
    title: story.title,
    slug: story.slug,
    excerpt: story.excerpt,
    image: story.coverImageUrl,
    imageAlt: story.coverImageAlt,
    publishedAt: story.publishedAt,
    url: story.type === 'communityPost' ? `/community/${story.slug}` : `/blog/${story.slug}`,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = QuerySchema.parse(Object.fromEntries(searchParams));

  const startIndex = (query.page - 1) * query.limit;
  const rangeEnd = Math.max(startIndex + query.limit - 1, startIndex);

  if (isSanityConfigured()) {
    try {
      const client = getSanityClient();

      if (client) {
        const [stories, total] = await Promise.all([
          client.fetch<RawSanityStory[]>(latestStoriesQuery, {
            offset: startIndex,
            rangeEnd,
          }),
          client.fetch<number>(latestStoriesCountQuery),
        ]);

        const mappedStories = stories
          .map(mapSanityStory)
          .filter((story): story is SanityStory => Boolean(story))
          .map((story) => mapStoryToApi(story));

        return NextResponse.json({
          ok: true,
          data: {
            posts: mappedStories,
            pagination: {
              currentPage: query.page,
              totalPages: total ? Math.max(Math.ceil(total / query.limit), 1) : 1,
              total: total ?? mappedStories.length,
              limit: query.limit,
            },
          },
          source: 'sanity',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Sanity blog content fetch failed:', error);
    }
  }

  // Fallback to Prisma ContentPage if Sanity is not configured
  try {
    const posts = await db.contentPage.findMany({
      where: {
        published: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: query.limit,
      skip: startIndex,
    });

    const total = await db.contentPage.count({
      where: {
        published: true,
      },
    });

    const mappedPosts = posts.map((post) => ({
      id: post.id,
      type: 'blogPost' as const,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || undefined,
      publishedAt: post.createdAt.toISOString(),
      url: `/blog/${post.slug}`,
    }));

    return NextResponse.json({
      ok: true,
      data: {
        posts: mappedPosts,
        pagination: {
          currentPage: query.page,
          totalPages: Math.ceil(total / query.limit),
          total,
          limit: query.limit,
        },
      },
      source: 'prisma',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Blog content API error:', error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to fetch blog posts',
        data: {
          posts: [],
          pagination: {
            currentPage: query.page,
            totalPages: 0,
            total: 0,
            limit: query.limit,
          },
        },
      },
      { status: 500 },
    );
  }
}
