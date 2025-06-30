import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CherryBlossomTree } from './components/games/CherryBlossomTree';
import { FeaturedProducts } from './components/shop/FeaturedProducts';
import { BlogPreview } from './components/blog/BlogPreview';
import { CommunityGallery } from './components/community/CommunityGallery';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Hero Section with Cherry Blossom Tree */}
      <section className="relative flex h-screen items-center justify-center overflow-hidden">
        <CherryBlossomTree />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center"
        >
          <h1 className="mb-6 text-5xl font-bold text-white md:text-7xl">Welcome to Otakumori</h1>
          <p className="mb-8 max-w-2xl text-xl text-pink-300 md:text-2xl">
            Where anime meets Dark Souls in a world of cherry blossoms and mystery
          </p>
          <div className="flex gap-4">
            <Link
              href="/shop"
              className="transform rounded-full bg-pink-600 px-8 py-3 text-white transition-colors duration-300 hover:scale-105 hover:bg-pink-700"
            >
              Explore Shop
            </Link>
            <Link
              href="/blog"
              className="transform rounded-full border-2 border-pink-600 bg-transparent px-8 py-3 text-pink-600 transition-colors duration-300 hover:scale-105 hover:bg-pink-600/10"
            >
              Read Blog
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Featured Products Section */}
      <section className="px-4 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mb-12 text-center text-4xl font-bold text-white">Featured Items</h2>
            <FeaturedProducts />
            <div className="mt-12 text-center">
              <Link
                href="/shop"
                className="inline-block transform rounded-full bg-pink-600 px-8 py-3 text-white transition-colors duration-300 hover:scale-105 hover:bg-pink-700"
              >
                View All Products
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blog Preview Section */}
      <section className="bg-gray-900/50 px-4 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mb-12 text-center text-4xl font-bold text-white">Latest Stories</h2>
            <BlogPreview />
            <div className="mt-12 text-center">
              <Link
                href="/blog"
                className="inline-block transform rounded-full border-2 border-pink-600 bg-transparent px-8 py-3 text-pink-600 transition-colors duration-300 hover:scale-105 hover:bg-pink-600/10"
              >
                Read More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Community Gallery Section */}
      <section className="px-4 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mb-12 text-center text-4xl font-bold text-white">Community Showcase</h2>
            <CommunityGallery />
            <div className="mt-12 text-center">
              <Link
                href="/community"
                className="inline-block transform rounded-full bg-pink-600 px-8 py-3 text-white transition-colors duration-300 hover:scale-105 hover:bg-pink-700"
              >
                Join Community
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
