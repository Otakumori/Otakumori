import { logger } from '@/app/lib/logger';
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const result = await safeFetch<BlogData>(`/api/v1/content/blog/${slug}`, { allowLive: true });
    if (isSuccess(result) && result.data?.post) {
      return {
        title: `${result.data.post.title} — Otaku-mori Blog`,
        description: result.data.post.excerpt || 'Read more on the Otaku-mori blog',
      };
    }
  } catch (error) {
    logger.error(
      'Error generating metadata for blog post:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
  }

  return {
    title: 'Post Not Found — Otaku-mori Blog',
    description: 'The requested blog post could not be found.',
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const result = await safeFetch<BlogData>(`/api/v1/content/blog/${slug}`, { allowLive: true });
    if (!isSuccess(result) || !result.data?.post) return notFound();

    const post = result.data.post;

    return (
      <main className="mori-page pt-24">
        <div className="mx-auto max-w-4xl px-5 py-10 sm:px-6 sm:py-14">
          <nav className="mb-8 text-sm" aria-label="Blog breadcrumb">
            <Link href={paths.blogIndex()} className="text-[#a9855f] transition-colors hover:text-[#c7a97f]">
              ← Back to Blog
            </Link>
          </nav>

          <header className="mb-10 border-b border-white/[0.08] pb-8">
            <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight text-[#fff1e4] md:text-5xl">
              {post.title}
            </h1>

            {post.excerpt && <p className="mt-5 max-w-3xl text-lg leading-8 text-[#cdbbb7]">{post.excerpt}</p>}

            <div className="mt-7 flex flex-wrap items-center gap-4 text-sm text-[#8f7f7d]">
              {post.author.avatar && (
                <Image
                  src={post.author.avatar}
                  alt=""
                  width={40}
                  height={40}
                  className="rounded-full border border-white/10 object-cover"
                />
              )}
              <span className="text-[#d6c9c4]">{post.author.name}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
          </header>

          {post.image && (
            <div className="mori-panel mb-10 overflow-hidden p-1">
              <div className="relative aspect-video overflow-hidden rounded-[0.75rem]">
                <Image src={post.image} alt={post.title} fill className="object-cover" priority />
              </div>
            </div>
          )}

          <article className="prose prose-invert prose-headings:font-display prose-headings:font-semibold prose-headings:text-[#fff1e4] prose-p:text-[#cdbbb7] prose-p:leading-8 prose-a:text-[#dca0b3] prose-strong:text-[#fff1e4] prose-blockquote:border-[#a9855f]/40 prose-blockquote:text-[#b9aeaa] max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 border-t border-white/[0.08] pt-6">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1 text-xs text-[#9f918c]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12">
            <Link href={paths.blogIndex()} className="mori-button-secondary">
              Back to Blog
            </Link>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    logger.error(
      'Error fetching blog post:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return notFound();
  }
}
