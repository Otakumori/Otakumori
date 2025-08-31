'use client';

import { motion } from 'framer-motion';
import SafetySettings from '@/app/components/SafetySettings';

export default function SafetyPage() {
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
            <h1 className="text-4xl font-bold text-white mb-4">Safety & Privacy</h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Control your privacy settings, manage blocked users, and customize your safety
              preferences to create a comfortable experience.
            </p>
          </motion.div>

          <SafetySettings />
        </div>
      </div>
    </div>
  );
}
