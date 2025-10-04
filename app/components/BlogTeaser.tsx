// DEPRECATED: This component is a duplicate. Use components\hero\BlogTeaser.tsx instead.
import GlassPanel from './GlassPanel';
import Link from 'next/link';

type Post = { id: string; slug: string; title: string; excerpt?: string; publishedAt?: string };

// Mock blog posts for now until blog API is properly implemented
const SAMPLE_POSTS: Post[] = [
  {
    id: '1',
    slug: 'welcome-to-otaku-mori',
    title: 'Welcome to Otaku-mori: Your New Digital Haven',
    excerpt: 'Discover what makes our community special and how to get started on your journey.',
    publishedAt: '2024-09-20'
  },
  {
    id: '2', 
    slug: 'mini-games-guide',
    title: 'Mini-Games Hub: Complete Guide for Beginners',
    excerpt: 'Learn the ins and outs of our GameCube-inspired gaming experience.',
    publishedAt: '2024-09-18'
  },
  {
    id: '3',
    slug: 'community-guidelines',
    title: 'Building a Positive Community Together',
    excerpt: 'Our approach to creating safe, welcoming spaces for all travelers.',
    publishedAt: '2024-09-15'
  }
];

export default async function BlogTeaser() {
  // Use sample posts for now, later replace with real blog service
  const posts = SAMPLE_POSTS;

  return (
    <section id="blog" className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
      {/* Section Header */}
      <div className="mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
          Latest Stories
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Insights, guides, and stories from the otaku community
        </p>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {posts.map((post) => (
          <GlassPanel key={post.id} className="group hover:scale-105 transition-all duration-300">
            <Link href={`/blog/${post.slug}`} className="block p-6">
              <div className="mb-4">
                <time className="text-sm text-pink-400 font-medium">
                  {post.publishedAt}
                </time>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 line-clamp-2 group-hover:text-pink-300 transition-colors">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-gray-300 line-clamp-3 mb-4">
                  {post.excerpt}
                </p>
              )}
              <div className="flex items-center text-pink-400 text-sm font-medium">
                Read More
                <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </GlassPanel>
        ))}
      </div>

      {/* View All CTA */}
      <div className="text-center">
        <Link
          href="/blog"
          className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
        >
          View All Posts
          <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
