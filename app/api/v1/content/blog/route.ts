import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    // For now, return demo blog posts
    // In production, this would fetch from a CMS or database
    const demoPosts = [
      {
        id: '1',
        slug: 'welcome-to-otaku-mori',
        title: 'Welcome to Otaku-mori',
        excerpt: 'Discover the world of anime gaming and collectible treasures.',
        publishedAt: '2024-01-15T10:00:00Z',
      },
      {
        id: '2',
        slug: 'cherry-blossom-season',
        title: 'Cherry Blossom Season Begins',
        excerpt: 'The petals are falling and new adventures await in our latest update.',
        publishedAt: '2024-01-10T14:30:00Z',
      },
      {
        id: '3',
        slug: 'petal-collection-guide',
        title: 'Petal Collection Guide',
        excerpt: 'Learn how to maximize your petal collection and unlock rare rewards.',
        publishedAt: '2024-01-05T09:15:00Z',
      },
    ];

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = demoPosts.slice(startIndex, endIndex);

    return NextResponse.json(paginatedPosts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json([], { status: 500 });
  }
}
