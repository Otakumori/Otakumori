'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const navItems = [
  { path: '/abyss', label: 'Home' },
  { path: '/abyss/shop', label: 'Shop' },
  { path: '/abyss/community', label: 'Community' },
  { path: '/abyss/gallery', label: 'Gallery' },
];

export default function AbyssLayout({ children }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isVerified, setIsVerified] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkVerification = async () => {
      if (session?.user) {
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('abyss_verified')
          .eq('user_id', session.user.id)
          .single();

        setIsVerified(preferences?.abyss_verified || false);
      }
    };

    checkVerification();
  }, [session, supabase]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="border-b border-pink-500/20 bg-gray-900/80 backdrop-blur-md"
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/abyss" className="text-2xl font-bold text-pink-500">
              The Abyss
            </Link>
            <div className="flex space-x-4">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`rounded-lg px-4 py-2 transition-colors ${
                    pathname === item.path
                      ? 'bg-pink-600 text-white'
                      : 'text-gray-400 hover:text-pink-500'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">{session.user.name || session.user.email}</span>
                  {isVerified && (
                    <span className="rounded-full bg-pink-500/20 px-2 py-1 text-sm text-pink-500">
                      Verified
                    </span>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="rounded-lg bg-pink-600 px-4 py-2 text-white transition-colors hover:bg-pink-700"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="relative">
        {/* Background Effects */}
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-500/10 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}
