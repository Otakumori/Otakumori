import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSanityClient, isSanityConfigured } from '@/lib/sanity/client';
import {
  communityPostsQuery,
  communityPostsCountQuery,
  mapSanityStory,
  type RawSanityStory,
  type SanityStory,
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

type ApiCommunityStory = SanityStory & { url: string };

const fallbackResponse = {
  ok: true,
  data: {
    posts: [] as ApiCommunityStory[],
    pagination: {
      currentPage: 1,
      totalPages: 0,
      total: 0,
      limit: 10,
    },
  },
  source: 'static',
  timestamp: new Date().toISOString(),
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = QuerySchema.parse(Object.fromEntries(searchParams));

  const startIndex = (query.page - 1) * query.limit;
  const rangeEnd = Math.max(startIndex + query.limit - 1, startIndex);

  if (!isSanityConfigured()) {
    return NextResponse.json(fallbackResponse);
  }

  try {
    const client = getSanityClient();

    if (!client) {
      return NextResponse.json(fallbackResponse);
    }

    const [stories, total] = await Promise.all([
      client.fetch<RawSanityStory[]>(communityPostsQuery, {
        offset: startIndex,
        rangeEnd,
      }),
      client.fetch<number>(communityPostsCountQuery),
    ]);

    const mappedStories = stories
      .map(mapSanityStory)
      .filter((story): story is SanityStory => Boolean(story));
    const apiStories: ApiCommunityStory[] = mappedStories.map((story) => ({
      ...story,
      url: `/community/${story.slug}`,
    }));

    return NextResponse.json({
      ok: true,
      data: {
        posts: apiStories,
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
  } catch (error) {
    console.error('Community content API error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to fetch community posts',
        data: fallbackResponse.data,
      },
      { status: 500 },
    );
  }
}

