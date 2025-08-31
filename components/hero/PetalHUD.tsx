/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { Flower, UserPlus, Crown } from 'lucide-react';

interface PetalHUDProps {
  petalCount: number;
  guestPetalCount?: number;
  guestCap?: number;
  isGuest?: boolean;
  onSignInClick?: () => void;
  className?: string;
}

export function PetalHUD({
  petalCount,
  guestPetalCount = 0,
  guestCap = 50,
  isGuest = false,
  onSignInClick,
  className = '',
}: PetalHUDProps) {
  const { isSignedIn, user } = useUser();
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [isVisible] = useState(true);

  // Show sign-in prompt for guests near cap
  useEffect(() => {
    if (isGuest && guestPetalCount >= guestCap * 0.8) {
      setShowSignInPrompt(true);
    } else {
      setShowSignInPrompt(false);
    }
  }, [isGuest, guestPetalCount, guestCap]);

  // Auto-hide after inactivity
  useEffect(() => {
    if (!isGuest) return;

    const timer = setTimeout(() => {
      setShowSignInPrompt(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isGuest, showSignInPrompt]);

  if (!isVisible) return null;

  return (
    <div className={`fixed right-4 top-4 z-50 ${className}`}>
      <AnimatePresence>
        {isSignedIn ? (
          // Authenticated user HUD
          <motion.div
            key="user-hud"
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="rounded-2xl border border-pink-300/30 bg-gradient-to-r from-pink-500/90 to-purple-500/90 p-4 shadow-2xl backdrop-blur-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Flower className="h-6 w-6 text-white" />
                <motion.div
                  className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-yellow-400"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{petalCount.toLocaleString()}</div>
                <div className="text-xs text-pink-100">Petals Collected</div>
              </div>
              {user?.imageUrl && (
                <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-white/30">
                  <img
                    src={user.imageUrl}
                    alt={user.fullName || 'User'}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Milestone indicator */}
            {petalCount >= 100 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 flex items-center justify-center space-x-1 rounded-lg bg-yellow-400/20 p-2"
              >
                <Crown className="h-4 w-4 text-yellow-400" />
                <span className="text-xs font-medium text-yellow-200">
                  {petalCount >= 1000 ? 'Legendary' : petalCount >= 500 ? 'Epic' : 'Rare'} Collector
                </span>
              </motion.div>
            )}
          </motion.div>
        ) : (
          // Guest HUD
          <motion.div
            key="guest-hud"
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="rounded-2xl border border-gray-400/30 bg-gradient-to-r from-gray-600/90 to-gray-700/90 p-4 shadow-2xl backdrop-blur-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Flower className="h-6 w-6 text-gray-300" />
                <motion.div
                  className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-gray-400"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
              <div>
                <div className="text-lg font-bold text-white">
                  {guestPetalCount}/{guestCap}
                </div>
                <div className="text-xs text-gray-300">Guest Petals</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-2 h-2 w-full rounded-full bg-gray-500/30">
              <motion.div
                className="h-2 rounded-full bg-gradient-to-r from-pink-400 to-purple-400"
                initial={{ width: 0 }}
                animate={{ width: `${(guestPetalCount / guestCap) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Sign-in prompt */}
            <AnimatePresence>
              {showSignInPrompt && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 overflow-hidden"
                >
                  <div className="rounded-lg border border-pink-400/30 bg-pink-500/20 p-3">
                    <div className="mb-2 flex items-center space-x-2">
                      <UserPlus className="h-4 w-4 text-pink-300" />
                      <span className="text-sm font-medium text-pink-200">
                        Sign in to bank your petals forever!
                      </span>
                    </div>
                    <button
                      onClick={onSignInClick}
                      className="w-full rounded-lg bg-pink-500 px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-pink-600"
                    >
                      Sign In Now
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
