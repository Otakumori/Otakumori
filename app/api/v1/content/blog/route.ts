import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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
    title: 'Welcome to Otaku-mori: A Journey Begins',
    slug: 'welcome-to-otaku-mori',
    excerpt:
      'Discover the magic of our anime-inspired community hub where gaming meets creativity.',
    content: 'Full blog post content here...',
    image: '/assets/blog/welcome.jpg',
    publishedAt: '2024-01-15T10:00:00Z',
    author: {
      name: 'Otaku-mori Team',
      avatar: '/assets/avatars/team.jpg',
    },
    tags: ['announcement', 'community', 'welcome'],
  },
  {
    id: '2',
    title: 'The Art of Petal Collection: A Guide',
    slug: 'petal-collection-guide',
    excerpt:
      'Learn the secrets of collecting petals and maximizing your rewards in our mini-games.',
    content: 'Full blog post content here...',
    image: '/assets/blog/petals.jpg',
    publishedAt: '2024-01-10T14:30:00Z',
    author: {
      name: 'Game Master',
      avatar: '/assets/avatars/gamemaster.jpg',
    },
    tags: ['guide', 'gaming', 'tips'],
  },
  {
    id: '3',
    title: 'Community Spotlight: Featured Artists',
    slug: 'community-spotlight-artists',
    excerpt:
      'Meet the talented artists who bring Otaku-mori to life with their incredible designs.',
    content: 'Full blog post content here...',
    image: '/assets/blog/artists.jpg',
    publishedAt: '2024-01-05T09:15:00Z',
    author: {
      name: 'Community Manager',
      avatar: '/assets/avatars/community.jpg',
    },
    tags: ['community', 'artists', 'spotlight'],
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = QuerySchema.parse(Object.fromEntries(searchParams));

    // Calculate pagination
    const startIndex = (query.page - 1) * query.limit;
    const endIndex = startIndex + query.limit;
    const paginatedPosts = mockBlogPosts.slice(startIndex, endIndex);

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
    console.error('Blog content API error:', error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to fetch blog posts',
        data: {
          posts: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            total: 0,
            limit: 10,
          },
        },
      },
      { status: 500 },
    );
  }
}
