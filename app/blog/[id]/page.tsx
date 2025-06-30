'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../../components/ui/button.tsx';
import { Card } from '../../components/ui/card.tsx';
import { Share2, Heart, Bookmark } from 'lucide-react';

// Mock blog data (replace with API call)
const blogPost = {
  id: '1',
  title: 'The Art of Anime Merchandise',
  content: `
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    
    <h2>The Evolution of Anime Collectibles</h2>
    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    
    <h2>Quality and Craftsmanship</h2>
    <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
  `,
  image: '/images/blog/post1.jpg',
  date: '2024-03-20',
  category: 'Merchandise',
  author: {
    name: 'John Doe',
    avatar: '/images/authors/john-doe.jpg',
    bio: 'Anime enthusiast and collector with over 10 years of experience in the industry.',
  },
  readTime: '5 min read',
  tags: ['Anime', 'Collectibles', 'Merchandise', 'Figures'],
};

const relatedPosts = [
  {
    id: '2',
    title: 'Top 10 Must-Have Manga Series',
    excerpt: 'Explore our curated list of essential manga collections...',
    image: '/images/blog/post2.jpg',
    date: '2024-03-18',
    category: 'Manga',
  },
  {
    id: '3',
    title: 'Anime Conventions Guide 2024',
    excerpt: 'Your ultimate guide to the biggest anime conventions...',
    image: '/images/blog/post3.jpg',
    date: '2024-03-15',
    category: 'Events',
  },
];

export default function BlogPostPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-red-900 pt-20">
      <article className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-4xl">
          <div className="mb-4 flex items-center gap-4 text-sm text-pink-400">
            <span>{blogPost.category}</span>
            <span>•</span>
            <span>{blogPost.readTime}</span>
            <span>•</span>
            <span>{new Date(blogPost.date).toLocaleDateString()}</span>
          </div>
          <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl">{blogPost.title}</h1>
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-full">
              <Image
                src={blogPost.author.avatar}
                alt={blogPost.author.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-white">{blogPost.author.name}</p>
              <p className="text-sm text-pink-200">{blogPost.author.bio}</p>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="mx-auto mb-12 max-w-4xl">
          <div className="relative h-[400px] overflow-hidden rounded-lg">
            <Image src={blogPost.image} alt={blogPost.title} fill className="object-cover" />
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-4xl">
          <div className="prose prose-invert prose-pink max-w-none">
            <div dangerouslySetInnerHTML={{ __html: blogPost.content }} />
          </div>

          {/* Tags */}
          <div className="mt-12 flex flex-wrap gap-2">
            {blogPost.tags.map(tag => (
              <span
                key={tag}
                className="rounded-full bg-pink-500/20 px-3 py-1 text-sm text-pink-200"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-4">
            <Button
              variant="outline"
              className="border-pink-500/30 text-pink-200 hover:bg-pink-500/10"
            >
              <Heart className="mr-2 h-4 w-4" />
              Like
            </Button>
            <Button
              variant="outline"
              className="border-pink-500/30 text-pink-200 hover:bg-pink-500/10"
            >
              <Bookmark className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button
              variant="outline"
              className="border-pink-500/30 text-pink-200 hover:bg-pink-500/10"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Related Posts */}
        <div className="mx-auto mt-20 max-w-4xl">
          <h2 className="mb-8 text-2xl font-bold text-white">Related Articles</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {relatedPosts.map(post => (
              <motion.div key={post.id} whileHover={{ y: -10 }} transition={{ duration: 0.2 }}>
                <Link href={`/blog/${post.id}`}>
                  <Card className="overflow-hidden border-pink-500/30 bg-white/10 backdrop-blur-lg">
                    <div className="relative h-48">
                      <Image src={post.image} alt={post.title} fill className="object-cover" />
                    </div>
                    <div className="p-6">
                      <span className="text-sm text-pink-400">{post.category}</span>
                      <h3 className="mt-2 text-xl font-semibold text-white">{post.title}</h3>
                      <p className="mt-2 text-pink-200">{post.excerpt}</p>
                      <p className="mt-4 text-sm text-pink-400">
                        {new Date(post.date).toLocaleDateString()}
                      </p>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </article>
    </main>
  );
}
