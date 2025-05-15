'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Abyss() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [showWarning, setShowWarning] = useState(true);

  useEffect(() => {
    // Check if user is logged in and has verified age
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleVerification = () => {
    setIsVerified(true);
    setShowWarning(false);
    // Store verification in user preferences
    localStorage.setItem('abyssVerified', 'true');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!isVerified && showWarning) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl bg-gray-900 p-8 rounded-lg shadow-xl"
        >
          <h1 className="text-4xl font-bold mb-6 text-pink-500">⚠️ The Abyss</h1>
          <p className="text-lg mb-4">
            This area contains explicit content intended for adults only. You must be 18 or older to proceed.
          </p>
          <div className="space-y-4">
            <button
              onClick={handleVerification}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              I am 18 or older
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Return to Safety
            </button>
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Abyss Shop Section */}
          <div className="bg-gray-900 p-6 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold text-pink-500 mb-4">Abyss Shop</h2>
            <p className="text-gray-400 mb-4">Exclusive R18 merchandise and collectibles</p>
            <button className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded">
              Enter Shop
            </button>
          </div>

          {/* Abyss Community Section */}
          <div className="bg-gray-900 p-6 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold text-pink-500 mb-4">Abyss Community</h2>
            <p className="text-gray-400 mb-4">Connect with like-minded individuals</p>
            <button className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded">
              Join Community
            </button>
          </div>

          {/* Abyss Gallery Section */}
          <div className="bg-gray-900 p-6 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold text-pink-500 mb-4">Abyss Gallery</h2>
            <p className="text-gray-400 mb-4">Exclusive R18 artwork and content</p>
            <button className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded">
              View Gallery
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
