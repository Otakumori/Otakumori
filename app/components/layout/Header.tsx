// DEPRECATED: This component is a duplicate. Use app\components\Header.js instead.
'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Search } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img
              src="/assets/logo.png"
              alt="Otaku-mori"
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="text-xl font-bold text-white">Otaku-mori</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center space-x-8 md:flex">
            <Link href="/shop" className="text-gray-300 transition-colors hover:text-white">
              Shop
            </Link>
            <Link href="/blog" className="text-gray-300 transition-colors hover:text-white">
              Blog
            </Link>
            <Link href="/mini-games" className="text-gray-300 transition-colors hover:text-white">
              Mini-Games
            </Link>
            <Link href="/community" className="text-gray-300 transition-colors hover:text-white">
              Community
            </Link>
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            <button
              className="text-gray-300 transition-colors hover:text-white"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link href="/shop/cart" className="text-gray-300 transition-colors hover:text-white">
              <ShoppingCart className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-pink-600 px-4 py-2 text-white transition-colors hover:bg-pink-700"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
