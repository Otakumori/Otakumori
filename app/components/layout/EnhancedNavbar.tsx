'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Menu, X } from 'lucide-react';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { useCart } from '../cart/CartProvider';
import GlassPanel from '../GlassPanel';
import { paths } from '@/lib/paths';

const EnhancedNavbar: React.FC = () => {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { itemCount } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Handle scroll for sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/blog', label: 'Blog' },
    { href: '/games', label: 'Games' },
    { href: '/community/soapstones', label: 'Community' },
  ];

  return (
    <motion.header
      className={`sticky top-0 z-20 transition-all duration-200 ease-out ${
        isScrolled ? 'shadow-lg shadow-black/20' : ''
      }`}
      initial={{ y: 0 }}
      animate={{ y: 0 }}
    >
      <GlassPanel
        className={`mx-3 mt-3 px-4 py-3 md:mx-6 md:mt-4 md:px-6 transition-all duration-200 ease-out ${
          isScrolled ? 'py-2' : ''
        }`}
      >
        <nav className="flex items-center justify-between gap-6">
          {/* Logo */}
          <Link
            href="/"
            className="font-semibold tracking-wide text-fuchsia-200 hover:text-fuchsia-100 transition-colors duration-200"
          >
            Otaku-mori
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link text-sm text-zinc-200 hover:text-white transition-all duration-200 ${
                  pathname === link.href ? 'text-fuchsia-300' : ''
                }`}
                aria-current={pathname === link.href ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative">
              <div
                className={`relative transition-all ${isSearchFocused ? 'ring-2 ring-pink-500/50 rounded-lg' : ''}`}
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="form-input pl-10 pr-4 py-2 w-64"
                />
                {/* Category dropdown placeholder - implement if needed */}
                {isCategoryDropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="absolute top-full mt-2 bg-black/90 rounded-lg p-2 shadow-lg"
                  >
                    <div className="text-white text-sm">Categories (coming soon)</div>
                  </div>
                )}
              </div>
            </form>

            {/* Cart */}
            <Link
              href={paths.cart()}
              className="relative p-2 text-zinc-200 hover:text-white transition-colors duration-200"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <motion.span
                  className="cart-badge absolute -top-1 -right-1 bg-fuchsia-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>

            {/* User Button */}
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <SignInButton mode="modal">
                <button className="btn-primary">Sign In</button>
              </SignInButton>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-zinc-200 hover:text-white transition-colors duration-200"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="md:hidden mt-4 pt-4 border-t border-white/10"
            >
              <div className="space-y-4">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <Link
                      href={link.href}
                      className={`block py-2 text-zinc-200 hover:text-white transition-colors duration-200 ${
                        pathname === link.href ? 'text-fuchsia-300' : ''
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Cart ({itemCount})</span>
                    {isSignedIn ? (
                      <UserButton afterSignOutUrl="/" />
                    ) : (
                      <SignInButton mode="modal">
                        <button className="btn-primary text-sm">Sign In</button>
                      </SignInButton>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassPanel>
    </motion.header>
  );
};

export default EnhancedNavbar;
