import { safeFetch, isSuccess, isBlocked } from '@/lib/safeFetch';
import Link from 'next/link';
import Image from 'next/image';
import { paths } from '@/lib/paths';
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card';
import { HeaderButton } from '@/components/ui/header-button';
import { handleServerError } from '@/app/lib/server-error-handler';
import { SectionHeader } from '@/app/components/home/SectionHeader';
import { EmptyState } from '@/app/components/home/EmptyState';

type StoryType = 'blogPost' | 'communityPost';

interface BlogPost {
  id: string;
  type: StoryType;
  title: string;
  excerpt?: string;
  slug: string;
  image?: string;
  imageAlt?: string;
  publishedAt: string;
  url?: string;
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

/**
 * BlogSection Server Component - NEVER throws errors.
 * All errors are caught and logged, always returns renderable content.
 */
export default async function BlogSection() {
  let posts: BlogPost[] = [];
  let isBlockedData = true;

  try {
    // Try blog content API first, then fallback
    const blogResult = await safeFetch<BlogData>('/api/v1/content/blog?limit=6', {
      allowLive: true,
    });

    const postsResult = await safeFetch<BlogData>('/api/blog/posts?limit=3', {
      allowLive: true,
    });

    const data = isSuccess(blogResult)
      ? blogResult.data
      : isSuccess(postsResult)
        ? postsResult.data
        : null;

    // Safely map posts with validation
    try {
      const rawPosts = data?.posts || data?.data || [];
      posts = Array.isArray(rawPosts)
        ? rawPosts
            .filter((post): post is BlogPost => post && typeof post === 'object' && 'id' in post && 'title' in post)
            .map((post) => ({
        ...post,
              imageAlt: (post as BlogPost).imageAlt ?? post.title ?? 'Blog post image',
            }))
        : [];
    } catch (mapError) {
      console.warn('[BlogSection] Failed to map posts:', mapError);
      posts = [];
    }
    
    isBlockedData = isBlocked(blogResult) && isBlocked(postsResult);
  } catch (error) {
    handleServerError(error, {
      section: 'blog',
      component: 'BlogSection',
      operation: 'fetch_posts',
      metadata: {
        endpoints: ['/api/v1/content/blog', '/api/blog/posts'],
      },
    }, {
      logLevel: 'warn',
    });
    posts = [];
    isBlockedData = true;
  }

  return (
    <div className="rounded-2xl p-8">
      <SectionHeader
        title="Latest Stories"
        description="Fresh drops from the blog and community message board"
      />

      {isBlockedData ? (
        <EmptyState
          title="Blog Coming Soon"
          description="We're preparing engaging content for you. Stay tuned!"
          actionLabel="Explore Blog"
          actionHref={paths.blogIndex()}
        />
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 3).map((post) => (
            <Link
              key={post.id}
              href={post.url || (post.type === 'communityPost' ? `/community/${post.slug}` : paths.blogPost(post.slug))}
              className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <GlassCard className="flex h-full flex-col">
                {post.image && (
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.imageAlt || post.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/70 transition-opacity duration-300 group-hover:opacity-95" />
                    <span className="absolute left-4 top-4 rounded-full bg-pink-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-pink-200 backdrop-blur">
                      {post.type === 'communityPost' ? 'Community' : 'Blog'}
                    </span>
                  </div>
                )}
                <GlassCardContent className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="mb-3 font-semibold text-white transition-colors group-hover:text-pink-300">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mb-4 line-clamp-3 text-sm text-white/70">{post.excerpt}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      {post.publishedAt
                        ? (() => {
                            try {
                              return new Date(post.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                              });
                            } catch {
                              return 'Recently';
                            }
                          })()
                        : 'Recently'}
                    </span>
                    {post.author?.name && <span>By {post.author.name}</span>}
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-pink-500/15 px-2 py-1 text-xs text-pink-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </GlassCardContent>
              </GlassCard>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Stories Yet"
          description="We're brewing up fresh lore. Check back soon for new blog entries and community posts."
          actionLabel="Explore Blog"
          actionHref={paths.blogIndex()}
        />
      )}

      {posts.length > 0 && (
        <div className="text-center mt-8">
          <HeaderButton href={paths.blogIndex()}>View All Posts</HeaderButton>
        </div>
      )}
    </div>
  );
}
