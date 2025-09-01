 
 
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MessageCircle, Heart, Share2, BookOpen } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  likes: number;
  comments: number;
  category: string;
  image: string;
}

const SAMPLE_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'The Cherry Blossom Code: Secrets of the Digital Shrine',
    excerpt:
      'In the depths of the virtual realm, where pixels dance like falling petals, lies a truth that transcends mere code. The shrine speaks in whispers of binary and beauty...',
    author: 'Digital Monk',
    date: '2024-08-26',
    readTime: '5 min read',
    likes: 42,
    comments: 17,
    category: 'Digital Philosophy',
    image: '/blog/cherry-blossom-code.jpg',
  },
  {
    id: '2',
    title: 'Petal Collection: The Art of Mindful Gaming',
    excerpt:
      'Beyond the screen, beyond the controller, there exists a space where every action becomes a meditation. Each petal caught is a moment of presence...',
    author: 'Zen Gamer',
    date: '2024-08-25',
    readTime: '3 min read',
    likes: 38,
    comments: 23,
    category: 'Mindful Gaming',
    image: '/blog/petal-collection.jpg',
  },
  {
    id: '3',
    title: 'Retro Aesthetics in Modern Design: Why Old Souls Matter',
    excerpt:
      "The pixel art of yesteryear wasn't just a limitation—it was a choice. A choice to find beauty in constraints, meaning in simplicity...",
    author: 'Pixel Sage',
    date: '2024-08-24',
    readTime: '7 min read',
    likes: 56,
    comments: 31,
    category: 'Design Philosophy',
    image: '/blog/retro-aesthetics.jpg',
  },
];

export function BlogTeaser() {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const handleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  return (
    <section id="blog-teaser" className="bg-gradient-to-br from-slate-50 to-blue-50 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-800">Latest Stories</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Discover the latest tales from the Otaku-mori community. Each story is a petal in the
            digital wind.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_POSTS.map((post) => (
            <article
              key={post.id}
              className="group overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-white/80" />
                </div>
                <div className="absolute top-3 left-3">
                  <span className="rounded-full bg-purple-600 px-3 py-1 text-xs font-medium text-white">
                    {post.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
                  <span>{post.author}</span>
                  <span>•</span>
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>

                <h3 className="mb-3 text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                  {post.title}
                </h3>

                <p className="mb-4 text-gray-600 line-clamp-3">{post.excerpt}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors ${
                        likedPosts.has(post.id)
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                      }`}
                    >
                      <Heart
                        className={`h-4 w-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`}
                      />
                      {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                    </button>

                    <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 text-sm text-gray-600">
                      <MessageCircle className="h-4 w-4" />
                      {post.comments}
                    </div>
                  </div>

                  <button
                    className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 transition-colors"
                    aria-label="Share post"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full border-2 border-purple-600 px-8 py-3 font-semibold text-purple-600 transition-colors duration-200 hover:bg-purple-600 hover:text-white"
          >
            <BookOpen className="h-5 w-5" />
            Read More Stories
          </Link>
        </div>
      </div>
    </section>
  );
}
