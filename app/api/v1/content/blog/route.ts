import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
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

// Mock blog posts for now - replace with actual database query
const mockBlogPosts = [
  {
    id: '1',
    type: 'blogPost' as const,
    title: 'Welcome Home, Traveler — The Otaku-mori Journey',
    slug: 'welcome-home-traveler',
    excerpt:
      'Where anime meets gaming, petals fall like memories, and every click echoes with nostalgia. Your sanctuary awaits.',
    content:
      'Welcome to Otaku-mori, where the boundaries between anime, gaming, and community blur into something magical. We built this space for those who understand that collecting petals is more than just a mechanic — it is a way to preserve moments, memories, and connections.',
    image: '/assets/blog/welcome.jpg',
    publishedAt: new Date().toISOString(),
    author: {
      name: 'Otaku-mori Team',
      avatar: '/assets/avatars/team.jpg',
    },
    tags: ['announcement', 'community', 'welcome'],
  },
  {
    id: '2',
    type: 'blogPost' as const,
    title: 'Petals, Runes, and the Currency of Memory',
    slug: 'petals-runes-currency',
    excerpt:
      'Every petal collected is a moment preserved. Learn how our reward system channels the spirit of classic gaming.',
    content:
      'In the world of Otaku-mori, petals are not just points — they are fragments of experience. Each one represents a moment of skill, a brushstroke of attention, a beat perfectly timed. Our rune system builds on this foundation, allowing you to transform these ephemeral moments into lasting power.',
    image: '/assets/blog/petals-system.jpg',
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    author: {
      name: 'The Curator',
      avatar: '/assets/avatars/curator.jpg',
    },
    tags: ['game-mechanics', 'petals', 'rewards'],
  },
  {
    id: '3',
    type: 'blogPost' as const,
    title: 'Dark Souls Meets Cherry Blossoms: Our Design Philosophy',
    slug: 'design-philosophy',
    excerpt:
      'How we blend the brutality of Souls-like messaging with the delicate beauty of anime aesthetics.',
    content:
      'Our design philosophy embraces contradiction: the harsh world of Dark Souls soapstone messages paired with the gentle fall of cherry blossoms. We believe in respecting the player intelligence while creating moments of wonder. Every interface element, every sound effect, every animation is crafted to evoke both nostalgia and discovery.',
    image: '/assets/blog/design.jpg',
    publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    author: {
      name: 'The Architect',
      avatar: '/assets/avatars/architect.jpg',
    },
    tags: ['design', 'philosophy', 'community'],
  },
];

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

  try {
    const paginatedPosts = mockBlogPosts.slice(startIndex, startIndex + query.limit);

    return NextResponse.json({
      ok: true,
      data: {
        posts: paginatedPosts,
        pagination: {
          currentPage: query.page,
          totalPages: Math.ceil(mockBlogPosts.length / query.limit),
          total: mockBlogPosts.length,
          limit: query.limit,
        },
      },
      source: 'mock-data',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Blog content API fallback error:', error);

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
