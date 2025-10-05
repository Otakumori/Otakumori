import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    // Mock blog post data - replace with actual database query
    const mockPosts = [
      {
        id: '1',
        title: 'Welcome to Otaku-mori: A Journey Begins',
        slug: 'welcome-to-otaku-mori',
        excerpt:
          'Discover the magic of our anime-inspired community hub where gaming meets creativity.',
        content: `
          <h2>Welcome to Our Community</h2>
          <p>Welcome to Otaku-mori, where anime culture meets interactive gaming in a beautiful, immersive experience. Our community hub is designed to bring together fellow travelers who share a passion for anime, gaming, and creative expression.</p>
          
          <h3>What Makes Us Special</h3>
          <p>At Otaku-mori, our unique approach of gamification of anime and gaming culture in the e commerce realm allows users to finally see dropshipping in a different light:</p>
          <ul>
            <li>Play engaging mini-games inspired by your favorite anime</li>
            <li>Discover unique merchandise and collectibles</li>
            <li>Connect with like-minded community members</li>
            <li>Earn petals through gameplay and achievements</li>
            <li>Leave messages for fellow travelers</li>
          </ul>
          
          <h3>Getting Started</h3>
          <p>Ready to begin your journey? Start by exploring our mini-games, browsing our shop, or checking out the latest blog posts. Every interaction earns you petals, which you can use to unlock special features and rewards.</p>
          
          <p>We're constantly adding new content and features, so make sure to check back regularly for updates. Welcome to the community, traveler!</p>
        `,
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
        content: `
          <h2>Understanding Petals</h2>
          <p>Petals are the currency of Otaku-mori, earned through gameplay, achievements, and community participation. Think of them as your digital cherry blossoms – beautiful, valuable, and a symbol of your journey through our world.</p>
          
          <h3>How to Earn Petals</h3>
          <p>There are several ways to collect petals in Otaku-mori:</p>
          <ul>
            <li><strong>Mini-Games:</strong> Complete games and achieve high scores</li>
            <li><strong>Daily Visits:</strong> Check in each day for bonus petals</li>
            <li><strong>Achievements:</strong> Unlock special accomplishments</li>
            <li><strong>Community Participation:</strong> Leave messages, interact with others</li>
            <li><strong>Shop Purchases:</strong> Earn bonus petals with every purchase</li>
          </ul>
          
          <h3>Maximizing Your Petal Collection</h3>
          <p>To get the most out of your petal collection:</p>
          <ol>
            <li>Play mini-games regularly – even short sessions add up</li>
            <li>Complete daily challenges and achievements</li>
            <li>Engage with the community through messages and interactions</li>
            <li>Check back daily for login bonuses</li>
            <li>Explore all areas of the site to discover hidden rewards</li>
          </ol>
          
          <p>Remember, petals are not just currency – they're a reflection of your dedication to the Otaku-mori community. Happy collecting!</p>
        `,
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
        content: `
          <h2>Celebrating Our Creative Community</h2>
          <p>One of the most amazing aspects of Otaku-mori is our incredible community of artists and creators. Today, we're shining a spotlight on some of the talented individuals who help bring our world to life.</p>
          
          <h3>Featured Artists</h3>
          <p>Our featured artists come from all walks of life, united by their passion for anime and digital art. They contribute everything from character designs to background artwork, helping to create the immersive experience that makes Otaku-mori special.</p>
          
          <h3>How to Get Involved</h3>
          <p>Are you an artist interested in contributing to Otaku-mori? We're always looking for talented creators to join our community. Here's how you can get involved:</p>
          <ul>
            <li>Submit your artwork through our community forums</li>
            <li>Participate in our monthly art challenges</li>
            <li>Share your creations in the community gallery</li>
            <li>Collaborate with other artists on special projects</li>
          </ul>
          
          <h3>Supporting Our Artists</h3>
          <p>You can support our community artists by:</p>
          <ul>
            <li>Purchasing their artwork through our shop</li>
            <li>Sharing their work on social media</li>
            <li>Leaving positive feedback and encouragement</li>
            <li>Participating in community discussions about their work</li>
          </ul>
          
          <p>Thank you to all our amazing artists for making Otaku-mori a beautiful and inspiring place to be!</p>
        `,
        image: '/assets/blog/artists.jpg',
        publishedAt: '2024-01-05T09:15:00Z',
        author: {
          name: 'Community Manager',
          avatar: '/assets/avatars/community.jpg',
        },
        tags: ['community', 'artists', 'spotlight'],
      },
    ];

    const post = mockPosts.find((p) => p.slug === slug);

    if (!post) {
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
      data: { post },
      source: 'mock-data',
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
