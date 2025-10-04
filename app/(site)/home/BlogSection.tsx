import { safeFetch, isSuccess, isBlocked } from '@/lib/safeFetch';
import Link from 'next/link';
import Image from 'next/image';

interface BlogPost {
  id: string;
  title: string;
  excerpt?: string;
  content?: string;
  slug: string;
  image?: string;
  publishedAt: string;
  author?: {
    name: string;
    avatar?: string;
  };
  tags?: string[];
}

interface BlogData {
  posts?: BlogPost[];
  data?: BlogPost[];
}

export default async function BlogSection() {
  // Try latest endpoint first, then fallback to posts
  const latestResult = await safeFetch<BlogData>('/api/blog/latest?limit=3', {
    allowLive: true,
  });

  const postsResult = await safeFetch<BlogData>('/api/blog/posts?limit=3', {
    allowLive: true,
  });

  const data = isSuccess(latestResult)
    ? latestResult.data
    : isSuccess(postsResult)
      ? postsResult.data
      : null;

  const posts = data?.posts || data?.data || [];
  const isBlockedData = isBlocked(latestResult) && isBlocked(postsResult);

  return (
    <div className="space-y-6">
      <header className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-pink-200">Blog</h2>
        <p className="text-pink-200/70 mt-2">Latest news, updates, and anime culture insights</p>
      </header>

      {isBlockedData ? (
        <div className="text-center py-12">
          <div className="glass-panel rounded-2xl p-8 max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-pink-200 mb-4">Blog Coming Soon</h3>
            <p className="text-pink-200/70 mb-6">
              We're preparing engaging content for you. Stay tuned!
            </p>
            <Link href="/blog" className="btn-primary inline-block">
              Explore Blog
            </Link>
          </div>
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.slice(0, 3).map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
              <div className="glass-panel rounded-2xl overflow-hidden hover:scale-105 transition-transform duration-300">
                {post.image && (
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-semibold text-pink-200 group-hover:text-pink-100 transition-colors mb-3">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-pink-200/70 text-sm line-clamp-3 mb-4">{post.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-pink-200/60">
                    <span>
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    {post.author && <span>By {post.author.name}</span>}
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-pink-300/70 bg-pink-500/20 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="glass-panel rounded-2xl p-8 max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-pink-200 mb-4">No Posts Available</h3>
            <p className="text-pink-200/70 mb-6">
              We're working on creating amazing content. Check back soon!
            </p>
            <Link href="/blog" className="btn-primary inline-block">
              Explore Blog
            </Link>
          </div>
        </div>
      )}

      {posts.length > 0 && (
        <div className="text-center mt-8">
          <Link href="/blog" className="btn-secondary inline-block">
            View All Posts
          </Link>
        </div>
      )}
    </div>
  );
}
