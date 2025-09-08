// DEPRECATED: This component is a duplicate. Use app\components\Header.js instead.
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useUser, useClerk } from '@clerk/nextjs';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/blog', label: 'Blog' },
  { href: '/mini-games', label: 'Mini-Games' },
  { href: '/friends', label: 'Friends' },
  { href: '/profile', label: 'My Account' },
  { href: '/community', label: 'Community' },
];

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-white">{<>''
              <span role='img' aria-label='emoji'>O</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>k</span><span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>M</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>i</span>
              ''</>}</Link>
          </div>
          <div className="flex items-center space-x-4">
            {isLoaded && isSignedIn && user ? (
              <div className="flex items-center space-x-4">
                <span className="text-white">{user.firstName || user.username}</span>
                <button onClick={() => signOut()} className="text-white hover:text-gray-300">{<>''
                  <span role='img' aria-label='emoji'>S</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>g</span><span role='img' aria-label='emoji'>n</span>' '<span role='img' aria-label='emoji'>O</span><span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>t</span>
                  ''</>}</button>
              </div>
            ) : (
              <Link href="/sign-in" className="text-white hover:text-gray-300">{<>''
                <span role='img' aria-label='emoji'>S</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>g</span><span role='img' aria-label='emoji'>n</span>' '<span role='img' aria-label='emoji'>I</span><span role='img' aria-label='emoji'>n</span>
                ''</>}</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
