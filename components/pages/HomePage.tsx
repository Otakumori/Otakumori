'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import InteractiveCherryBlossom from '@/components/animations/InteractiveCherryBlossom';
import { type Product, type BlogPost, type SocialLink } from '../../app/types/index';
import Header from '@/components/layout/Header';

const socialLinks: SocialLink[] = [
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/Otakumorii',
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.129 11.854v-8.385H7.37V12.073h2.769V9.03c0-2.758 1.67-4.256 4.107-4.256 1.195 0 2.37.214 2.37.214v2.604h-1.324c-1.304 0-1.71.805-1.71 1.647v1.916h2.93l-.466 2.891h-2.464V23.927C19.612 23.027 24 18.063 24 12.073z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/otakumoriii/#',
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
];

interface HomePageProps {
  products: Product[];
  blogPosts: BlogPost[];
}

export default function HomePage({ products, blogPosts }: HomePageProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black pt-16 text-white">
      <Header />
      <InteractiveCherryBlossom />

      {/* Hero Section Buttons Below Hero */}
      <section className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8">
        <Link
          href="/shop"
          className="rounded-lg bg-pink-600 px-6 py-3 transition-colors hover:bg-pink-700"
        >
          Shop Now
        </Link>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="mb-8 text-center text-3xl font-bold">Featured Products</h2>
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product: Product) => {
              const imageSrc = product.images?.[0] ?? null;
              const firstVariant = product.variants?.[0] ?? null;
              const productTitle = product.title ?? 'Product';

              return (
                <motion.div
                  key={product.id}
                  className="overflow-hidden rounded-xl bg-gray-800 transition-shadow hover:shadow-lg"
                  whileHover={{ y: -5 }}
                >
                  <Link href={`/shop/${product.id}`}>
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={productTitle}
                        width={400}
                        height={192}
                        className="h-48 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-48 w-full items-center justify-center bg-gray-700 text-gray-400">
                        No Image
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="mb-2 text-xl font-semibold">{productTitle}</h3>
                      {firstVariant ? (
                        <p className="font-bold text-pink-500">
                          ${(firstVariant.price / 100).toFixed(2)}
                        </p>
                      ) : (
                        <p className="text-gray-400">Price N/A</p>
                      )}
                    </div>
                  </Link>
                  <div className="p-4 pt-0">
                    <button className="w-full rounded-lg bg-pink-600 py-2 text-white transition-colors hover:bg-pink-700">
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-center">No featured products found.</p>
        )}
      </section>

      {/* Blog Preview */}
      <section className="bg-gray-900/50 px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-8 text-center text-3xl font-bold">Latest from Blog</h2>
          {blogPosts && blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {blogPosts.map((post: BlogPost) => (
                <motion.div
                  key={post.id}
                  className="overflow-hidden rounded-xl bg-gray-800 transition-shadow hover:shadow-lg"
                  whileHover={{ y: -5 }}
                >
                  <Link href={`/blog/${post.id}`}>
                    <Image
                      src={post.image}
                      alt={post.title}
                      width={400}
                      height={192}
                      className="h-48 w-full object-cover"
                    />
                    <div className="p-4">
                      <h3 className="mb-2 text-xl font-semibold">{post.title}</h3>
                      <p className="mb-4 text-gray-400">{post.excerpt}</p>
                      <span className="text-pink-500 transition-colors hover:text-pink-400">
                        Read More →
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center">No blog posts found.</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-6 text-white">
        <div className="container mx-auto px-4 text-center">
          {/* Social Icons Above Text */}
          <div className="mb-4 flex justify-center space-x-6">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition-colors hover:text-pink-500"
              >
                {link.icon}
              </a>
            ))}
          </div>

          {/* Navigation Links */}
          <div className="mb-4 flex justify-center space-x-6 text-sm">
            <Link href="/" className="hover:text-pink-500">
              Home
            </Link>
            <Link href="/shop" className="hover:text-pink-500">
              Shop
            </Link>
            <Link href="/blog" className="hover:text-pink-500">
              Blog
            </Link>
            <Link href="/mini-games" className="hover:text-pink-500">
              Mini-Games
            </Link>
            <Link href="/my-account" className="hover:text-pink-500">
              My Account
            </Link>
            <Link href="/community" className="hover:text-pink-500">
              Community
            </Link>
          </div>

          <p className="text-lg font-bold text-gray-400">Otaku-mori</p>
          <p className="mb-4 text-sm text-gray-500">
            Stay a while. Let's blossom together.{' '}
            <span role="img" aria-label="Cherry blossom">
              🌸
            </span>
          </p>

          <div className="mb-2 flex justify-center space-x-4 text-sm text-gray-500">
            <Link href="/contact" className="hover:text-pink-500">
              Contact Us
            </Link>
          </div>

          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Otaku-mori. Made with{' '}
            <span role="img" aria-label="Red heart">
              ❤️
            </span>
          </p>
        </div>
      </footer>
    </main>
  );
}
