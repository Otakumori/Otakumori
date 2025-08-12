'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { usePetalContext } from '@/providers';

const navItems = [
  { path: '/abyss', label: 'Home' },
  { path: '/abyss/shop', label: 'Shop' },
  { path: '/abyss/community', label: 'Community' },
  { path: '/abyss/gallery', label: 'Gallery' },
];

export default function AbyssLayout({ children }) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const { petals } = usePetalContext();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
          <p className="text-lg text-pink-500">Loading your journey...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-black/80 backdrop-blur-sm' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/abyss" className="text-xl font-bold text-pink-500">
                The Abyss
              </Link>
              <div className="hidden space-x-6 md:flex">
                {navItems.map(item => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`text-sm font-medium transition-colors ${
                      pathname === item.path ? 'text-pink-500' : 'text-gray-300 hover:text-pink-400'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-pink-500">🌸</span>
                <span className="text-gray-300">{petals}</span>
              </div>
              <Link href="/" className="text-sm font-medium text-gray-300 hover:text-pink-400">
                Return to Surface
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      <main className="pt-16">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
