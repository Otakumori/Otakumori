/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
        if (!response.ok) {
          throw new Error('Failed to fetch blog posts');
        }

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
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">Error: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">No blog posts available yet.</div>
        <div className="text-sm text-gray-500">Check back soon for new content!</div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <article
          key={post.id}
          className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:border-pink-400/30 transition-all duration-300 hover:scale-105"
        >
          <Link href={`/blog/${post.slug}`} className="block p-6 h-full">
            <div className="mb-4">
              {post.category && (
                <span className="inline-block px-3 py-1 bg-pink-600/20 text-pink-300 text-xs rounded-full border border-pink-500/30">
                  {post.category}
                </span>
              )}
            </div>

            <h2 className="text-xl font-semibold text-white mb-3 line-clamp-2">{post.title}</h2>

            {post.excerpt && (
              <p className="text-gray-300 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
            )}

            <div className="mt-auto pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>{post.author?.display_name || post.author?.username || 'Anonymous'}</span>
                {post.publishedAt && <span>{new Date(post.publishedAt).toLocaleDateString()}</span>}
              </div>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}
