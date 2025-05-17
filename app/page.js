'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      {/* Hero Section with Cherry Blossom Tree */}
      <section className="relative flex h-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/cherry-blossom-tree.jpg"
            alt="Cherry Blossom Tree"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-40" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 px-4 text-center"
        >
          <h1 className="mb-6 text-5xl font-bold text-white md:text-7xl">Welcome to Otaku-m</h1>
          <p className="mb-8 text-xl text-gray-200 md:text-2xl">
            Your ultimate destination for anime and gaming culture
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center space-x-4"
          >
            <Link
              href="/shop"
              className="rounded-full bg-pink-500 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-pink-600"
            >
              Explore Shop
            </Link>
            {!session && (
              <Link
                href="/auth/signin"
                className="rounded-full bg-gray-800 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-gray-700"
              >
                Sign In
              </Link>
            )}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 transform"
        >
          <div className="flex h-10 w-6 justify-center rounded-full border-2 border-white">
            <motion.div
              animate={{
                y: [0, 12, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: 'loop',
              }}
              className="mt-2 h-3 w-1 rounded-full bg-white"
            />
          </div>
        </motion.div>
      </section>

      {/* Featured Products Section */}
      <section className="px-4 py-20">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-pink-400">Featured Collections</h2>
            <p className="text-gray-300">Discover our latest anime and gaming merchandise</p>
          </motion.div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Product cards will be dynamically populated from Printify */}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/shop"
              className="inline-block rounded-full bg-pink-500 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-pink-600"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Preview Section */}
      <section className="bg-gray-900 px-4 py-20">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-pink-400">Latest Updates</h2>
            <p className="text-gray-300">Stay tuned for the latest news and articles</p>
          </motion.div>

          {/* Blog Preview Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Blog preview cards will be dynamically populated */}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/blog"
              className="inline-block rounded-full bg-gray-800 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-gray-700"
            >
              Read More
            </Link>
          </div>
        </div>
      </section>

      {/* Mini Games Preview Section */}
      <section className="px-4 py-20">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-pink-400">Mini Games</h2>
            <p className="text-gray-300">
              Play games, collect rewards, and unlock exclusive content
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="overflow-hidden rounded-lg bg-gray-800"
            >
              <div className="relative h-64">
                <Image
                  src="/images/cherry-blossom-game.jpg"
                  alt="Cherry Blossom Collection"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="mb-2 text-2xl font-bold text-pink-400">Cherry Blossom Collection</h3>
                <p className="mb-4 text-gray-300">Collect falling petals and earn rewards</p>
                <Link
                  href="/abyss/games/petal-collection"
                  className="inline-block rounded-full bg-pink-500 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-pink-600"
                >
                  Play Now
                </Link>
              </div>
            </motion.div>

            {/* Add more game previews here */}
          </div>
        </div>
      </section>
    </div>
  );
}
