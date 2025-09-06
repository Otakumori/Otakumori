// DEPRECATED: This component is a duplicate. Use app\components\components\Layout.jsx instead.
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function GamesLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="border-b border-pink-500/20 bg-gray-800 bg-opacity-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/abyss" className="text-pink-400 hover:text-pink-300">
              ← Back to Abyss
            </Link>
            <div className="flex space-x-6">
              <Link
                href="/abyss/games/petal-collection"
                className="text-gray-300 transition-colors hover:text-pink-400"
              >
                Petal Collection
              </Link>
              {/* Add more game links here as they are created */}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="container mx-auto px-4 py-8"
      >
        {children}
      </motion.main>
    </div>
  );
}
