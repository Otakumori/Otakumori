'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  publishedAt?: string;
  author?: {
    username: string;
    display_name?: string;
  };
}

export default function BlogIndex() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/blog/posts?limit=20');
        if (!response.ok) throw new Error('Failed to fetch blog posts');
        const result = await response.json();
        setPosts(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="mori-panel-soft flex min-h-48 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border border-[#efc7d2]/20 border-t-[#efc7d2]/70" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mori-panel-soft py-10 text-center">
        <p className="text-sm text-[#e0aaa6]">{error}</p>
        <button onClick={() => window.location.reload()} className="mori-button-secondary mt-4">
          Try again
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="mori-panel-soft py-12 text-center">
        <p className="font-display text-lg text-[#fff1e4]">No stories have been posted yet.</p>
        <p className="mt-2 text-sm text-[#8f7f7d]">The archive will open when the first entry is published.</p>
      </div>
    );
  }

  const [lead, ...rest] = posts;

  return (
    <div className="space-y-8">
      {lead && (
        <article className="mori-panel overflow-hidden">
          <Link href={`/blog/${lead.slug}`} className="grid min-h-64 gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="flex flex-col justify-end p-6 sm:p-8 lg:p-10">
              {lead.category && (
                <div className="mb-4 text-xs uppercase tracking-[0.14em] text-[#a9855f]">{lead.category}</div>
              )}
              <h2 className="font-display max-w-2xl text-3xl font-semibold leading-tight text-[#fff1e4] sm:text-4xl">
                {lead.title}
              </h2>
              {lead.excerpt && <p className="mt-4 max-w-2xl text-base leading-7 text-[#cdbbb7]">{lead.excerpt}</p>}
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#8f7f7d]">
                <span>{lead.author?.display_name || lead.author?.username || 'Otaku-mori'}</span>
                {lead.publishedAt && <span>{new Date(lead.publishedAt).toLocaleDateString()}</span>}
              </div>
            </div>
            <div
              aria-hidden="true"
              className="min-h-48 border-t border-white/[0.07] bg-[radial-gradient(circle_at_30%_25%,rgba(220,160,179,0.13),transparent_34%),radial-gradient(circle_at_70%_70%,rgba(169,133,95,0.09),transparent_30%),linear-gradient(145deg,#120d12,#070608)] lg:border-l lg:border-t-0"
            />
          </Link>
        </article>
      )}

      {rest.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {rest.map((post) => (
            <article key={post.id} className="mori-panel-soft transition-colors hover:border-white/[0.14]">
              <Link href={`/blog/${post.slug}`} className="flex h-full flex-col p-5 sm:p-6">
                {post.category && <div className="text-[11px] uppercase tracking-[0.14em] text-[#a9855f]">{post.category}</div>}
                <h2 className="font-display mt-3 text-xl font-semibold leading-snug text-[#fff1e4]">{post.title}</h2>
                {post.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#cdbbb7]/82">{post.excerpt}</p>}
                <div className="mt-auto flex flex-wrap justify-between gap-3 border-t border-white/[0.07] pt-5 text-xs text-[#8f7f7d]">
                  <span>{post.author?.display_name || post.author?.username || 'Otaku-mori'}</span>
                  {post.publishedAt && <span>{new Date(post.publishedAt).toLocaleDateString()}</span>}
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
