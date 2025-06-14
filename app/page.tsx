import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import InteractiveCherryBlossom from '@/components/animations/InteractiveCherryBlossom';
import { Product, BlogPost, SocialLink } from '@/app/types';
import Header from '@/components/layout/Header';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

const socialLinks: SocialLink[] = [
  {
    name: "Facebook",
    url: "https://www.facebook.com/Otakumorii",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.129 11.854v-8.385H7.37V12.073h2.769V9.03c0-2.758 1.67-4.256 4.107-4.256 1.195 0 2.37.214 2.37.214v2.604h-1.324c-1.304 0-1.71.805-1.71 1.647v1.916h2.93l-.466 2.891h-2.464V23.927C19.612 23.027 24 18.063 24 12.073z"/>
      </svg>
    )
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/otakumoriii/#",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    )
  }
];

export default async function Page() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: products } = await supabase.from('products').select();
  const { data: blogPosts } = await supabase.from('blog_posts').select();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pt-16">
      <Header />
      <InteractiveCherryBlossom />

      {/* Hero Section Buttons Below Hero */}
      <section className="py-8 px-4 max-w-7xl mx-auto flex flex-col items-center gap-4">
        <Link 
          href="/shop" 
          className="px-6 py-3 bg-pink-600 rounded-lg hover:bg-pink-700 transition-colors"
        >
          Shop Now
        </Link>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Products</h2>
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product: Product) => (
              <motion.div
                key={product.id}
                className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                whileHover={{ y: -5 }}
              >
                <Link href={`/shop/${product.id}`}>
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.title || 'Product image'}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-700 flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{product.title}</h3>
                    {product.variants && product.variants.length > 0 ? (
                      <p className="text-pink-500 font-bold">${(product.variants[0].price / 100).toFixed(2)}</p>
                    ) : (
                      <p className="text-gray-400">Price N/A</p>
                    )}
                  </div>
                </Link>
                <div className="p-4 pt-0">
                  <button className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition-colors">
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center">No featured products found.</p>
        )}
      </section>

      {/* Blog Preview */}
      <section className="py-16 px-4 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Latest from Blog</h2>
          {blogPosts && blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {blogPosts.map((post: BlogPost) => (
                <motion.div
                  key={post.id}
                  className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                  whileHover={{ y: -5 }}
                >
                  <Link href={`/blog/${post.id}`}>
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                      <p className="text-gray-400 mb-4">{post.excerpt}</p>
                      <span className="text-pink-500 hover:text-pink-400 transition-colors">
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
      <footer className="bg-black text-white py-6">
        <div className="container mx-auto px-4 text-center">
          {/* Social Icons Above Text */}
          <div className="flex justify-center space-x-6 mb-4">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-500 transition-colors"
              >
                {link.icon}
              </a>
            ))}
          </div>
          
          {/* Navigation Links */}
          <div className="flex justify-center space-x-6 mb-4 text-sm">
            <Link href="/" className="hover:text-pink-500">Home</Link>
            <Link href="/shop" className="hover:text-pink-500">Shop</Link>
            <Link href="/blog" className="hover:text-pink-500">Blog</Link>
            <Link href="/mini-games" className="hover:text-pink-500">Mini-Games</Link>
            <Link href="/my-account" className="hover:text-pink-500">My Account</Link>
            <Link href="/community" className="hover:text-pink-500">Community</Link>
          </div>

          <p className="text-gray-400 text-lg font-bold">Otaku-mori</p>
          <p className="text-gray-500 text-sm mb-4">Stay a while. Let's blossom together. 🌸</p>

          <div className="flex justify-center space-x-4 text-gray-500 text-sm mb-2">
            <Link href="/contact" className="hover:text-pink-500">Contact Us</Link>
          </div>
          
          <p className="text-gray-600 text-xs">&copy; {new Date().getFullYear()} Otaku-mori. Made with ❤️</p>
        </div>
      </footer>
    </main>
  );
} 