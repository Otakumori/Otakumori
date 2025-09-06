import Link from 'next/link';
import Image from 'next/image';
import GlassPanel from '../GlassPanel';
import { t } from '../../lib/microcopy';

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  publishedAt?: string;
  image?: string;
  author?: string;
  readTime?: number;
};

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/v1/content/blog?limit=12`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}

export default async function BlogIndex() {
  const posts = await getBlogPosts();

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <GlassPanel className="p-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            No blog posts yet
          </h2>
          <p className="text-zinc-400">
            Check back later for new content!
          </p>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Featured Post */}
      {posts.length > 0 && (
        <GlassPanel className="overflow-hidden">
          <Link href={`/blog/${posts[0].slug}`} className="block">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="relative aspect-video md:aspect-square">
                {posts[0].image ? (
                  <Image
                    src={posts[0].image}
                    alt={posts[0].title}
                    fill
                    sizes="(max-width:768px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20">
                    <span className="text-6xl">📝</span>
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col justify-center">
                <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-fuchsia-300 transition-colors">
                  {posts[0].title}
                </h2>
                {posts[0].excerpt && (
                  <p className="text-zinc-300 mb-4 line-clamp-3">
                    {posts[0].excerpt}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-zinc-400">
                  {posts[0].publishedAt && (
                    <span>
                      {new Date(posts[0].publishedAt).toLocaleDateString()}
                    </span>
                  )}
                  {posts[0].readTime && (
                    <span>{posts[0].readTime} min read</span>
                  )}
                  {posts[0].author && (
                    <span>by {posts[0].author}</span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </GlassPanel>
      )}

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.slice(1).map((post) => (
          <GlassPanel key={post.id} className="group overflow-hidden">
            <Link href={`/blog/${post.slug}`} className="block">
              <div className="relative aspect-video w-full overflow-hidden">
                {post.image ? (
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20">
                    <span className="text-4xl">📝</span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-fuchsia-300 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                
                {post.excerpt && (
                  <p className="text-sm text-zinc-300 mb-3 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    {post.publishedAt && (
                      <span>
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </span>
                    )}
                    {post.readTime && (
                      <span>• {post.readTime} min</span>
                    )}
                  </div>
                  
                  {post.author && (
                    <span>{post.author}</span>
                  )}
                </div>
              </div>
            </Link>
          </GlassPanel>
        ))}
      </div>

      {/* Load More Button */}
      <div className="text-center">
        <button className="rounded-xl bg-fuchsia-500/90 px-8 py-3 text-white hover:bg-fuchsia-500 transition-colors">
          Load More Posts
        </button>
      </div>
    </div>
  );
}
