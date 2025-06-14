'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center gap-4 text-sm text-pink-400 mb-4">
            <span>{blogPost.category}</span>
            <span>•</span>
            <span>{blogPost.readTime}</span>
            <span>•</span>
            <span>{new Date(blogPost.date).toLocaleDateString()}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {blogPost.title}
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-full overflow-hidden">
              <Image
                src={blogPost.author.avatar}
                alt={blogPost.author.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-white font-semibold">{blogPost.author.name}</p>
              <p className="text-pink-200 text-sm">{blogPost.author.bio}</p>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <Image
              src={blogPost.image}
              alt={blogPost.title}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-invert prose-pink max-w-none">
            <div dangerouslySetInnerHTML={{ __html: blogPost.content }} />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-12">
            {blogPost.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-200 text-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-8">
            <Button variant="outline" className="border-pink-500/30 text-pink-200 hover:bg-pink-500/10">
              <Heart className="w-4 h-4 mr-2" />
              Like
            </Button>
            <Button variant="outline" className="border-pink-500/30 text-pink-200 hover:bg-pink-500/10">
              <Bookmark className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" className="border-pink-500/30 text-pink-200 hover:bg-pink-500/10">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Related Posts */}
        <div className="max-w-4xl mx-auto mt-20">
          <h2 className="text-2xl font-bold text-white mb-8">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {relatedPosts.map((post) => (
              <motion.div
                key={post.id}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Link href={`/blog/${post.id}`}>
                  <Card className="bg-white/10 backdrop-blur-lg border-pink-500/30 overflow-hidden">
                    <div className="relative h-48">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <span className="text-pink-400 text-sm">{post.category}</span>
                      <h3 className="text-xl font-semibold text-white mt-2">{post.title}</h3>
                      <p className="text-pink-200 mt-2">{post.excerpt}</p>
                      <p className="text-pink-400 text-sm mt-4">
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