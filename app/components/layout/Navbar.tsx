/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../cart/CartProvider';
import { ShoppingCart, Menu, X, User, Heart, Gift } from 'lucide-react';
import PetalWallet from '../PetalWallet';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { itemCount } = useCart();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-black/50 backdrop-blur-lg">
      {/* Skip to content for accessibility */}
      <a
        href="#main-content"
        className="sr-only absolute left-2 top-2 z-50 rounded bg-pink-400/80 px-3 py-1 text-white focus:not-sr-only"
      >
        Skip to main content
      </a>
      <nav
        className="container mx-auto flex items-center justify-between px-4 py-3"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link href="/" aria-label="Home">
          <Image
            src="/assets/logo.png"
            alt="Otaku-mori Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-6 text-white md:flex">
          <Link href="/shop" className="transition-colors hover:text-pink-500" aria-label="Shop">
            Shop
          </Link>
          <Link
            href="/community"
            className="transition-colors hover:text-pink-500"
            aria-label="Community"
          >
            Community
          </Link>
          <Link
            href="/achievements"
            className="transition-colors hover:text-pink-500"
            aria-label="Achievements"
          >
            Achievements
          </Link>
          <Link
            href="/events"
            className="transition-colors hover:text-pink-500"
            aria-label="Events"
          >
            Events
          </Link>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-3">
          <Link
            href="/wishlist"
            className="text-white transition-colors hover:text-pink-500"
            aria-label="Wishlist"
          >
            <Heart size={20} />
          </Link>
          <Link
            href="/achievements"
            className="text-white transition-colors hover:text-pink-500"
            aria-label="Achievements"
          >
            <Gift size={20} />
          </Link>
          <Link
            href="/cart"
            className="relative text-white transition-colors hover:text-pink-500"
            aria-label="Cart"
          >
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span
                className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                aria-label={`Cart items: ${itemCount}`}
              >
                {itemCount}
              </span>
            )}
          </Link>
          <Link
            href="/profile"
            className="text-white transition-colors hover:text-pink-500"
            aria-label="Profile"
          >
            <User size={20} />
          </Link>
          <PetalWallet />
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-white"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-black/90 backdrop-blur-lg md:hidden"
            role="menu"
            aria-label="Mobile navigation"
          >
            <Link
              href="/shop"
              className="text-2xl text-white"
              aria-label="Shop"
              tabIndex={0}
              onClick={() => setIsMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              href="/community"
              className="text-2xl text-white"
              aria-label="Community"
              tabIndex={0}
              onClick={() => setIsMenuOpen(false)}
            >
              Community
            </Link>
            <Link
              href="/achievements"
              className="text-2xl text-white"
              aria-label="Achievements"
              tabIndex={0}
              onClick={() => setIsMenuOpen(false)}
            >
              Achievements
            </Link>
            <Link
              href="/events"
              className="text-2xl text-white"
              aria-label="Events"
              tabIndex={0}
              onClick={() => setIsMenuOpen(false)}
            >
              Events
            </Link>
            <Link
              href="/profile"
              className="text-2xl text-white"
              aria-label="Profile"
              tabIndex={0}
              onClick={() => setIsMenuOpen(false)}
            >
              Profile
            </Link>
            <button
              onClick={toggleMenu}
              className="absolute right-4 top-4 text-white"
              aria-label="Close menu"
            >
              <X size={32} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
