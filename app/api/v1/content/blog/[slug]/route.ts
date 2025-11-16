import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    // Mock blog post data - replace with actual database query
    // These slugs match the homepage teasers from BlogSection
    const mockPosts = [
      {
        id: '1',
        title: 'Welcome Home, Traveler — The Otaku-mori Journey',
        slug: 'welcome-home-traveler',
        excerpt:
          'Where anime meets gaming, petals fall like memories, and every click echoes with nostalgia. Your sanctuary awaits.',
        content: `
          <h2>Welcome to Otaku-mori</h2>
          <p>Welcome to Otaku-mori, where the boundaries between anime, gaming, and community blur into something magical. We built this space for those who understand that collecting petals is more than just a mechanic — it is a way to preserve moments, memories, and connections.</p>
          
          <h3>What Makes Us Special</h3>
          <p>At Otaku-mori, our unique approach blends the nostalgia of classic gaming with the beauty of anime culture. Every interaction is designed to evoke both wonder and familiarity:</p>
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
        title: 'Petals, Runes, and the Currency of Memory',
        slug: 'petals-runes-currency',
        excerpt:
          'Every petal collected is a moment preserved. Learn how our reward system channels the spirit of classic gaming.',
        content: `
          <h2>Understanding Petals and Runes</h2>
          <p>In the world of Otaku-mori, petals are not just points — they are fragments of experience. Each one represents a moment of skill, a brushstroke of attention, a beat perfectly timed. Our rune system builds on this foundation, allowing you to transform these ephemeral moments into lasting power.</p>
          
          <h3>The Currency of Memory</h3>
          <p>Petals serve as the currency of memory in our world. Every interaction, every achievement, every moment of engagement contributes to your petal collection. Think of them as digital cherry blossoms — beautiful, fleeting, but when collected, they form a tapestry of your journey.</p>
          
          <h3>How to Earn Petals</h3>
          <p>There are several ways to collect petals in Otaku-mori:</p>
          <ul>
            <li><strong>Mini-Games:</strong> Complete games and achieve high scores</li>
            <li><strong>Daily Visits:</strong> Check in each day for bonus petals</li>
            <li><strong>Achievements:</strong> Unlock special accomplishments</li>
            <li><strong>Community Participation:</strong> Leave messages, interact with others</li>
            <li><strong>Shop Purchases:</strong> Earn bonus petals with every purchase</li>
          </ul>
          
          <h3>Transforming Petals into Runes</h3>
          <p>Runes are the evolved form of petals — permanent markers of your dedication and skill. As you collect petals, you'll unlock the ability to convert them into runes, which grant lasting benefits and unlock new areas of the site.</p>
          
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
        title: 'Dark Souls Meets Cherry Blossoms: Our Design Philosophy',
        slug: 'design-philosophy',
        excerpt:
          'How we blend the brutality of Souls-like messaging with the delicate beauty of anime aesthetics.',
        content: `
          <h2>Our Design Philosophy</h2>
          <p>Our design philosophy embraces contradiction: the harsh world of Dark Souls soapstone messages paired with the gentle fall of cherry blossoms. We believe in respecting the player intelligence while creating moments of wonder. Every interface element, every sound effect, every animation is crafted to evoke both nostalgia and discovery.</p>
          
          <h3>The Souls-Like Influence</h3>
          <p>Dark Souls taught us that players appreciate challenge, mystery, and community-driven discovery. The soapstone messaging system — where players leave cryptic hints for each other — inspired our own community features. We wanted to capture that sense of shared exploration and mutual support.</p>
          
          <h3>The Anime Aesthetic</h3>
          <p>At the same time, we're deeply inspired by anime's ability to blend the mundane with the magical. Cherry blossoms represent fleeting beauty, perfect moments that pass too quickly. Our petal system embodies this — collectible, beautiful, but ephemeral unless preserved through gameplay.</p>
          
          <h3>Finding Balance</h3>
          <p>The challenge is finding balance between these two influences. We want players to feel challenged but not frustrated, guided but not hand-held. Every design decision asks: "Does this respect the player's intelligence while still being accessible?"</p>
          
          <h3>Community as Design</h3>
          <p>Perhaps most importantly, we believe that community is not just a feature — it's a fundamental part of the design. The messages left by fellow travelers, the shared achievements, the collective exploration of our world — these aren't additions to the experience, they ARE the experience.</p>
          
          <p>This philosophy guides every decision we make, from the smallest UI element to the largest feature. Welcome to a world where challenge meets beauty, where community shapes the journey, and where every petal tells a story.</p>
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
