'use client';

import { motion, AnimatePresence } from 'framer-motion';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="auth"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="flex min-h-screen items-center justify-center bg-black bg-gradient-to-br from-gray-900 to-gray-950"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
