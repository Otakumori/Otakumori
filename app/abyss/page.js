'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function Abyss() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkVerification = async () => {
      if (status === 'authenticated' && session?.user) {
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('abyss_verified')
          .eq('user_id', session.user.id)
          .single();

        if (preferences?.abyss_verified) {
          setIsVerified(true);
          setShowWarning(false);
        }
      }
      setIsLoading(false);
    };

    checkVerification();
  }, [status, session, supabase]);

  const handleVerification = async () => {
    if (session?.user) {
      await supabase.from('user_preferences').upsert({
        user_id: session.user.id,
        abyss_verified: true,
        verified_at: new Date().toISOString(),
      });
    }
    setIsVerified(true);
    setShowWarning(false);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-16 w-16 rounded-full border-4 border-pink-500 border-t-transparent"
        />
      </div>
    );
  }

  if (!isVerified && showWarning) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-4 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="max-w-2xl rounded-lg bg-gray-900 p-8 shadow-xl"
        >
          <motion.h1
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="mb-6 text-4xl font-bold text-pink-500"
          >
            ⚠️ The Abyss
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4 text-lg"
          >
            This area contains explicit content intended for adults only. You must be 18 or older to
            proceed.
          </motion.p>
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleVerification}
              className="w-full rounded-lg bg-pink-600 px-6 py-3 font-bold text-white transition-colors hover:bg-pink-700"
            >
              I am 18 or older
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/')}
              className="w-full rounded-lg bg-gray-700 px-6 py-3 font-bold text-white transition-colors hover:bg-gray-600"
            >
              Return to Safety
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {/* Abyss Shop Section */}
          <motion.div whileHover={{ scale: 1.02 }} className="rounded-lg bg-gray-900 p-6 shadow-xl">
            <h2 className="mb-4 text-2xl font-bold text-pink-500">Abyss Shop</h2>
            <p className="mb-4 text-gray-400">Exclusive R18 merchandise and collectibles</p>
            <Link href="/abyss/shop">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded bg-pink-600 px-4 py-2 font-bold text-white hover:bg-pink-700"
              >
                Enter Shop
              </motion.button>
            </Link>
          </motion.div>

          {/* Abyss Community Section */}
          <motion.div whileHover={{ scale: 1.02 }} className="rounded-lg bg-gray-900 p-6 shadow-xl">
            <h2 className="mb-4 text-2xl font-bold text-pink-500">Abyss Community</h2>
            <p className="mb-4 text-gray-400">Connect with like-minded individuals</p>
            <Link href="/abyss/community">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded bg-pink-600 px-4 py-2 font-bold text-white hover:bg-pink-700"
              >
                Join Community
              </motion.button>
            </Link>
          </motion.div>

          {/* Abyss Gallery Section */}
          <motion.div whileHover={{ scale: 1.02 }} className="rounded-lg bg-gray-900 p-6 shadow-xl">
            <h2 className="mb-4 text-2xl font-bold text-pink-500">Abyss Gallery</h2>
            <p className="mb-4 text-gray-400">Exclusive R18 artwork and content</p>
            <Link href="/abyss/gallery">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded bg-pink-600 px-4 py-2 font-bold text-white hover:bg-pink-700"
              >
                View Gallery
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
