'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import FriendsOverlay from './FriendsOverlay';

interface FriendsButtonProps {
  className?: string;
}

export default function FriendsButton({ className = '' }: FriendsButtonProps) {
  const { user } = useUser();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [onlineCount, setOnlineCount] = useState(3); // Mock data

  if (!user) return null;

  return (
    <>
      <motion.button
        onClick={() => setIsOverlayOpen(true)}
        className={`relative flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/20 hover:border-pink-400/40 transition-all duration-200 ${className}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative">
          <svg
            className="w-5 h-5 text-pink-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {onlineCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-pink-900"
            />
          )}
        </div>
        <span className="text-sm font-medium text-pink-300">Friends</span>
        {onlineCount > 0 && (
          <span className="text-xs text-green-400 font-semibold">{onlineCount} online</span>
        )}
      </motion.button>

      <FriendsOverlay isOpen={isOverlayOpen} onClose={() => setIsOverlayOpen(false)} />
    </>
  );
}
