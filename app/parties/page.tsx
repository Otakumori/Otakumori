'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import PartyHub from '@/app/components/PartyHub';
import GlassCard from '@/app/components/ui/GlassCard';

// Metadata is handled by layout.tsx for client components

export default function PartiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-4">Party Hub</h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Create or join parties to play mini-games together. Team up with friends for
              cooperative adventures and competitive challenges.
            </p>
          </motion.div>

          <Suspense
            fallback={
              <GlassCard className="p-8 text-center">
                <div className="animate-pulse">
                  <div className="h-6 bg-white/10 rounded mb-4"></div>
                  <div className="h-4 bg-white/5 rounded mb-2"></div>
                  <div className="h-4 bg-white/5 rounded w-3/4 mx-auto"></div>
                </div>
              </GlassCard>
            }
          >
            <PartyHub />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
