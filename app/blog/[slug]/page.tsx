import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { paths } from '@/lib/paths';
import { safeFetch, isSuccess } from '@/lib/safeFetch';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image?: string;
  publishedAt: string;
  author: {
    name: string;
    avatar?: string;
  };
  tags?: string[];
}

interface BlogData {
  post?: BlogPost;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const result = await safeFetch<BlogData>(`/api/v1/content/blog/${params.slug}`, {
      allowLive: true,
    });

    if (isSuccess(result) && result.data?.post) {
      return {
        title: `${result.data.post.title} — Otaku-mori Blog`,
        description: result.data.post.excerpt || 'Read more on the Otaku-mori blog',
      };
    }
  } catch (error) {
    console.error('Error generating metadata for blog post:', error);
  }

  return {
    title: 'Post Not Found — Otaku-mori Blog',
    description: 'The requested blog post could not be found.',
  };
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  try {
    const result = await safeFetch<BlogData>(`/api/v1/content/blog/${params.slug}`, {
      allowLive: true,
    });

    if (!isSuccess(result) || !result.data?.post) {
      return notFound();
    }

    const post = result.data.post;

    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black">
        <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-muted">
              <li>
                <Link href={paths.blogIndex()} className="hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>/</li>
              <li className="text-primary">{post.title}</li>
            </ol>
          </nav>

          {/* Article Header */}
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">{post.title}</h1>

            {post.excerpt && (
              <p className="text-xl text-secondary mb-8 leading-relaxed">{post.excerpt}</p>
            )}

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                {post.author.avatar && (
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                )}
                <div>
                  <p className="text-primary font-medium">{post.author.name}</p>
                  <p className="text-muted text-sm">
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Link href={paths.blogIndex()} className="btn-secondary">
                  ← Back to Blog
                </Link>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.image && (
            <div className="mb-12">
              <div className="relative aspect-video overflow-hidden rounded-2xl glass-card">
                <Image src={post.image} alt={post.title} fill className="object-cover" priority />
              </div>
            </div>
          )}

          {/* Article Content */}
          <article className="prose prose-invert max-w-none">
            <div
              className="text-secondary leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-glass-border">
              <h3 className="text-lg font-semibold text-primary mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-accent-pink/20 text-sm text-accent-pink rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Back to Blog */}
          <div className="mt-12 text-center">
            <Link href={paths.blogIndex()} className="btn-primary">
              ← Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return notFound();
  }
}
