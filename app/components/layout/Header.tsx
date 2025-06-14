'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Search } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
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
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/shop" className="text-gray-300 hover:text-white transition-colors">
              Shop
            </Link>
            <Link href="/blog" className="text-gray-300 hover:text-white transition-colors">
              Blog
            </Link>
            <Link href="/mini-games" className="text-gray-300 hover:text-white transition-colors">
              Mini-Games
            </Link>
            <Link href="/community" className="text-gray-300 hover:text-white transition-colors">
              Community
            </Link>
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-300 hover:text-white transition-colors">
              <Search className="h-5 w-5" />
            </button>
            <Link href="/shop/cart" className="text-gray-300 hover:text-white transition-colors">
              <ShoppingCart className="h-5 w-5" />
            </Link>
            <Link 
              href="/login" 
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
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