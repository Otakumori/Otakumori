'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/components/cart/CartProvider';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Menu, X, User, Heart, Gift } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { itemCount } = useCart();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="w-full bg-black/50 backdrop-blur-lg sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/">
          <Image
            src="/assets/logo.png"
            alt="Otaku-mori Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 text-white">
          <Link href="/shop" className="hover:text-pink-500 transition-colors">Shop</Link>
          <Link href="/community" className="hover:text-pink-500 transition-colors">Community</Link>
          <Link href="/achievements" className="hover:text-pink-500 transition-colors">Achievements</Link>
          <Link href="/events" className="hover:text-pink-500 transition-colors">Events</Link>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4">
          <Link href="/wishlist" className="text-white hover:text-pink-500 transition-colors">
            <Heart size={20} />
          </Link>
          <Link href="/achievements" className="text-white hover:text-pink-500 transition-colors">
            <Gift size={20} />
          </Link>
          <Link href="/cart" className="relative text-white hover:text-pink-500 transition-colors">
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-xs text-white rounded-full h-4 w-4 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
          <Link href="/profile" className="text-white hover:text-pink-500 transition-colors">
            <User size={20} />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-white">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-black/70 backdrop-blur-lg px-4 py-2"
          >
            <div className="flex flex-col gap-2 text-white">
              <Link href="/shop" className="py-2 hover:text-pink-500 transition-colors" onClick={toggleMenu}>Shop</Link>
              <Link href="/community" className="py-2 hover:text-pink-500 transition-colors" onClick={toggleMenu}>Community</Link>
              <Link href="/achievements" className="py-2 hover:text-pink-500 transition-colors" onClick={toggleMenu}>Achievements</Link>
              <Link href="/events" className="py-2 hover:text-pink-500 transition-colors" onClick={toggleMenu}>Events</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar; 