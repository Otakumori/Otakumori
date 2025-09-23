'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Menu, X, ChevronDown } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { useAuth } from '@/app/hooks/useAuth';
import { useAuthContext } from '../../contexts/AuthContext';
import { useCart } from '../cart/CartProvider';
import { CATEGORIES } from '@/lib/categories';
import { parseQuery } from '@/lib/search/parse';
import PetalWallet from '../PetalWallet';

const Navbar: React.FC = () => {
  const { isSignedIn, isAdmin } = useAuth();
  const { requireAuth } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const { itemCount } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileShopOpen, setIsMobileShopOpen] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const parsed = parseQuery(searchQuery);

    // If category directive, redirect to category page
    if (parsed.category) {
      router.push(`/shop/c/${parsed.category}`);
    } else {
      // Regular search
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }

    setSearchQuery('');
    setIsSearchFocused(false);
  };

  // Handle category selection
  const handleCategorySelect = (categorySlug: string) => {
    router.push(`/shop/c/${categorySlug}`);
    setIsCategoryDropdownOpen(false);
    setIsMenuOpen(false);
    setIsMobileShopOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-black/50 backdrop-blur-lg font-ui">
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
            src="/assets/images/circlelogo.png"
            alt="Otaku-mori Logo"
            width={40}
            height={40}
            className="rounded-full"
            priority
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-6 text-white md:flex">
          <Link
            href="/"
            className={`transition-colors hover:text-pink-500 relative ${
              pathname === '/' ? 'text-pink-400' : ''
            }`}
            aria-label="Home"
          >
            Home
            {pathname === '/' && (
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-pink-400 rounded-full shadow-[0_0_4px_rgba(255,79,163,0.6)]" />
            )}
          </Link>

          {/* Shop Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className={`flex items-center space-x-1 transition-colors hover:text-pink-500 relative ${
                pathname.startsWith('/shop') ? 'text-pink-400' : ''
              }`}
              aria-expanded={isCategoryDropdownOpen}
              aria-haspopup="true"
              aria-label="Shop categories"
            >
              <span>Shop</span>
              <ChevronDown className="w-4 h-4" />
              {pathname.startsWith('/shop') && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-pink-400 rounded-full shadow-[0_0_4px_rgba(255,79,163,0.6)]" />
              )}
            </button>

            {isCategoryDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-black/95 backdrop-blur-md border border-white/10 rounded-lg shadow-xl">
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-3">Categories</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category.slug}
                        onClick={() => handleCategorySelect(category.slug)}
                        className="text-left p-2 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label={`View ${category.label} category`}
                      >
                        <div className="font-medium">{category.label}</div>
                        {category.description && (
                          <div className="text-xs text-white/60 mt-1">{category.description}</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/blog"
            className={`transition-colors hover:text-pink-500 relative ${
              pathname.startsWith('/blog') ? 'text-pink-400' : ''
            }`}
            aria-label="Blog"
          >
            Blog
            {pathname.startsWith('/blog') && (
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-pink-400 rounded-full shadow-[0_0_4px_rgba(255,79,163,0.6)]" />
            )}
          </Link>
          <Link
            href="/mini-games"
            className={`transition-colors hover:text-pink-500 relative ${
              pathname.startsWith('/mini-games') ? 'text-pink-400' : ''
            }`}
            aria-label="Mini-Games"
          >
            Mini-Games
            {pathname.startsWith('/mini-games') && (
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-pink-400 rounded-full shadow-[0_0_4px_rgba(255,79,163,0.6)]" />
            )}
          </Link>
          <Link
            href="/about"
            className={`transition-colors hover:text-pink-500 relative ${
              pathname === '/about' ? 'text-pink-400' : ''
            }`}
            aria-label="About"
          >
            About
            {pathname === '/about' && (
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-pink-400 rounded-full shadow-[0_0_4px_rgba(255,79,163,0.6)]" />
            )}
          </Link>
        </div>

        {/* Center Search */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="What're ya buyin' ?"
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Search suggestions */}
            {isSearchFocused && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-black/95 backdrop-blur-md border border-white/10 rounded-lg shadow-xl z-10">
                <div className="p-2">
                  <div className="text-xs text-white/60 mb-2">Quick categories:</div>
                  <div className="space-y-1">
                    {CATEGORIES.slice(0, 6).map((category) => (
                      <button
                        key={category.slug}
                        onClick={() => {
                          setSearchQuery(`cat:${category.slug}`);
                          handleSearch({ preventDefault: () => {} } as React.FormEvent);
                        }}
                        className="w-full text-left p-2 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label={`Search ${category.label} category`}
                      >
                        <span className="font-medium">cat:{category.slug}</span>
                        <span className="text-xs text-white/60 ml-2">{category.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              requireAuth(() => router.push('/wishlist'), 'Please sign in to view your wishlist')
            }
            className="text-white transition-colors hover:text-pink-500 text-xl"
            aria-label="Wishlist"
          >
            ♡
          </button>
          <button
            onClick={() =>
              requireAuth(() => router.push('/cart'), 'Please sign in to view your cart')
            }
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
          </button>

          {/* Authentication */}
          {isSignedIn ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30">
                  Admin
                </span>
              )}
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'h-8 w-8',
                    userButtonPopoverCard: 'bg-black/90 backdrop-blur-md border border-white/20',
                    userButtonPopoverActionButton: 'text-white hover:bg-white/10',
                    userButtonPopoverActionButtonText: 'text-white',
                    userButtonPopoverFooter: 'hidden',
                  },
                }}
                userProfileMode="navigation"
                userProfileUrl="/account"
              />
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="px-4 py-2 bg-[#ff4fa3] hover:bg-[#ff86c2] text-white rounded-lg transition-all duration-200 animate-pulse hover:animate-none"
            >
              Sign In
            </Link>
          )}

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
            ref={mobileMenuRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-black/90 backdrop-blur-lg md:hidden"
            role="menu"
            aria-label="Mobile navigation"
          >
            <Link
              href="/"
              className="text-2xl text-white"
              aria-label="Home"
              tabIndex={0}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>

            {/* Mobile Shop Accordion */}
            <div>
              <button
                onClick={() => setIsMobileShopOpen(!isMobileShopOpen)}
                className="flex items-center justify-between w-full text-2xl text-white"
                aria-label="Shop categories"
                aria-expanded={isMobileShopOpen ? 'true' : 'false'}
              >
                <span>Shop</span>
                <ChevronDown
                  className={`w-6 h-6 transition-transform ${isMobileShopOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isMobileShopOpen && (
                <div className="mt-4 pl-4 space-y-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category.slug}
                      onClick={() => handleCategorySelect(category.slug)}
                      className="block w-full text-left text-lg text-white/70 hover:text-white transition-colors"
                      aria-label={`View ${category.label} category`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/blog"
              className="text-2xl text-white"
              aria-label="Blog"
              tabIndex={0}
              onClick={() => setIsMenuOpen(false)}
            >
              Blog
            </Link>
            <Link
              href="/mini-games"
              className="text-2xl text-white"
              aria-label="Mini-Games"
              tabIndex={0}
              onClick={() => setIsMenuOpen(false)}
            >
              Mini-Games
            </Link>
            <Link
              href="/about"
              className="text-2xl text-white"
              aria-label="About"
              tabIndex={0}
              onClick={() => setIsMenuOpen(false)}
            >
              About
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
