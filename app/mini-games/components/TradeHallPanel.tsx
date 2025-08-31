'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
// import { COPY } from '@/app/lib/copy';

export default function TradeHallPanel() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
    >
      <div className="bg-white/95 backdrop-blur-md border border-white/30 rounded-2xl p-8 max-w-md mx-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Trade Hall</h2>
        <p className="text-gray-600 mb-6">
          Collect items from mini-games and trade with other players. Craft rare items and build
          your collection!
        </p>

        <div className="space-y-3">
          <Link href="/mini-games/trade-hall">
            <motion.button
              className="w-full px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Enter Trade Hall
            </motion.button>
          </Link>

          <div className="text-sm text-gray-500">
            <p>• Collect items from mini-games</p>
            <p>• Craft rare items from common ones</p>
            <p>• Trade with other players</p>
            <p>• Build your collection</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
