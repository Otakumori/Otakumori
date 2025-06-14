'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

// Mock blog data
const blogPosts = [
  {
    id: '1',
    title: 'The Art of Anime Merchandise',
    excerpt: 'Discover the craftsmanship behind our premium anime figures and how they bring your favorite characters to life.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    image: '/images/blog/post1.jpg',
    date: '2024-03-20',
    category: 'Merchandise',
    author: 'John Doe',
    readTime: '5 min read',
  },
  {
    id: '2',
    title: 'Top 10 Must-Have Manga Series',
    excerpt: 'Explore our curated list of essential manga collections that every otaku should have in their library.',
    content: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    image: '/images/blog/post2.jpg',
    date: '2024-03-18',
    category: 'Manga',
    author: 'Jane Smith',
    readTime: '8 min read',
  },
  {
    id: '3',
    title: 'Anime Conventions Guide 2024',
    excerpt: 'Your ultimate guide to the biggest anime conventions happening this year and how to make the most of them.',
    content: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    image: '/images/blog/post3.jpg',
    date: '2024-03-15',
    category: 'Events',
    author: 'Mike Johnson',
    readTime: '6 min read',
  },
];

const categories = ['All', 'Merchandise', 'Manga', 'Events', 'Community', 'Reviews'];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-red-900 pt-20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">Otakumori Blog</h1>
          <p className="text-xl text-pink-200">Discover the latest in anime culture, merchandise, and community</p>
        </div>

        {/* Search and Filters */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-200" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-pink-500/30 text-white placeholder-pink-200"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === category
                  ? 'bg-pink-500 text-white'
                  : 'bg-white/10 text-pink-200 hover:bg-pink-500/20'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <motion.div
              key={post.id}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Link href={`/blog/${post.id}`}>
                <Card className="bg-white/10 backdrop-blur-lg border-pink-500/30 overflow-hidden h-full">
                  <div className="relative h-48">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-pink-400 mb-2">
                      <span>{post.category}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">{post.title}</h2>
                    <p className="text-pink-200 mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-pink-400">
                      <span>{post.author}</span>
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-pink-200 text-lg">No articles found matching your criteria</p>
          </div>
        )}
      </div>
    </main>
  );
}
