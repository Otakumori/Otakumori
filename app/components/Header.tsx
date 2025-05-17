'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { UserButton, SignInButton, SignedIn, SignedOut } from '@clerk/clerk-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/blog', label: 'Blog' },
  { href: '/minigames', label: 'Mini-Games' },
  { href: '/friends', label: 'Friends' },
  { href: '/profile', label: 'My Account' },
  { href: '/community', label: 'Community' },
];

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 z-50 w-full bg-black shadow-lg transition-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex min-w-[180px] items-center space-x-3">
            <Link href="/" className="flex items-center">
              <Image
                src="/assets/logo.png"
                alt="Otaku-mori Logo"
                width={44}
                height={44}
                className="rounded-full bg-pink-100"
              />
              <span className="ml-2 text-2xl font-bold text-pink-200 drop-shadow">Otaku-mori</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden flex-1 justify-center space-x-8 md:flex">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-semibold text-pink-100 transition hover:text-pink-300 ${pathname === link.href ? 'text-pink-400 underline underline-offset-4' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden min-w-[120px] items-center justify-end md:flex">
            <input
              type="text"
              placeholder="What're ya buyin'"
              className="w-32 rounded-lg bg-gray-800 px-2 py-1 text-base text-white placeholder-pink-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              style={{ height: '2.25rem' }}
            />
          </div>

          {/* Mobile Hamburger */}
          <button
            className="ml-2 text-pink-100 hover:text-pink-300 focus:outline-none md:hidden"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Open menu"
          >
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Clerk AuthBar */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-pink-100 hover:text-pink-300"
            >
              <span className="sr-only">Search</span>
            </button>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'ring-2 ring-pink-400 hover:ring-pink-500 transition-all',
                    userButtonPopoverCard: 'bg-black/90 border-pink-400',
                    userButtonPopoverActionButton: 'text-pink-400 hover:bg-pink-900/30',
                  },
                }}
                afterSignOutUrl="/"
              />
            </SignedIn>
            <SignedOut>
              <SignInButton>
                <button className="shadow-glow rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 font-bold text-white transition-all hover:scale-105">
                  Sign In / Register
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute left-0 right-0 z-40 flex flex-col items-center space-y-4 rounded-b-2xl bg-gray-900 py-6 shadow-lg md:hidden"
            >
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-lg font-semibold text-pink-100 hover:text-pink-300 ${pathname === link.href ? 'text-pink-400 underline underline-offset-4' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4">
                <SignedIn>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: 'ring-2 ring-pink-400 hover:ring-pink-500 transition-all',
                        userButtonPopoverCard: 'bg-black/90 border-pink-400',
                        userButtonPopoverActionButton: 'text-pink-400 hover:bg-pink-900/30',
                      },
                    }}
                    afterSignOutUrl="/"
                  />
                </SignedIn>
                <SignedOut>
                  <SignInButton>
                    <button className="shadow-glow rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 font-bold text-white transition-all hover:scale-105">
                      Sign In / Register
                    </button>
                  </SignInButton>
                </SignedOut>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>

        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="py-4"
          >
            <input
              type="text"
              placeholder="Whattrya buying?"
              className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white placeholder-pink-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </motion.div>
        )}
      </div>
    </header>
  );
}
