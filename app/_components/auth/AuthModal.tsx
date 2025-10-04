/**
 * Authentication Modal - Complete Implementation
 * 
 * Features:
 * - Modal intercept for gated actions
 * - Beautiful glass UI design
 * - Smooth transitions and animations
 * - Context-aware messaging
 * - Clerk integration with SSR safety
 * - Accessibility compliant
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SignIn, SignUp, useAuth } from '@clerk/nextjs';
import { X, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'signin' | 'signup';
  context?: {
    action: string;
    description: string;
    iconType: 'soapstone' | 'praise' | 'wishlist' | 'trade' | 'community';
    benefits?: string[];
  };
  redirectUrl?: string;
  onSuccess?: () => void;
}

const DEFAULT_CONTEXT = {
  action: 'Sign in to continue',
  description: 'Join the Otaku-mori community to unlock all features',
  iconType: 'community' as const,
  benefits: [
    'Save your game progress',
    'Earn and spend Petals',
    'Join community discussions',
    'Track achievements',
    'Access exclusive content'
  ]
};

const CONTEXT_CONFIGS = {
  soapstone: {
    action: 'Sign in to leave a sign for fellow travelers',
    description: 'Share your wisdom and messages with the community',
    icon: '',
    color: 'from-amber-500 to-orange-600',
    benefits: [
      'Leave meaningful messages',
      'Build your reputation',
      'Connect with travelers',
      'Share discoveries'
    ]
  },
  praise: {
    action: 'Sign in to send praise to other travelers',
    description: 'Spread positivity and recognition in the community',
    icon: '',
    color: 'from-pink-500 to-purple-600',
    benefits: [
      'Appreciate great content',
      'Build community bonds',
      'Earn karma points',
      'Unlock praise badges'
    ]
  },
  wishlist: {
    action: 'Sign in to add items to your wishlist',
    description: 'Curate your perfect collection of anime treasures',
    icon: '',
    color: 'from-red-500 to-pink-600',
    benefits: [
      'Save favorite items',
      'Track price changes',
      'Get restock alerts',
      'Share collections'
    ]
  },
  trade: {
    action: 'Sign in to present offers in the Scarlet Bazaar',
    description: 'Join the bustling marketplace of rare finds',
    icon: '',
    color: 'from-emerald-500 to-teal-600',
    benefits: [
      'Trade rare items',
      'Build trust reputation',
      'Access exclusive deals',
      'Connect with collectors'
    ]
  },
  community: {
    action: 'Sign in to participate in community discussions',
    description: 'Join conversations with fellow otaku',
    icon: '',
    color: 'from-blue-500 to-indigo-600',
    benefits: [
      'Join discussions',
      'Share your thoughts',
      'Get recommendations',
      'Build friendships'
    ]
  }
};

export default function AuthModal({ 
  isOpen, 
  onClose, 
  mode = 'signin',
  context,
  redirectUrl,
  onSuccess 
}: AuthModalProps) {
  const [currentMode, setCurrentMode] = useState<'signin' | 'signup'>(mode);
  const [isLoading, setIsLoading] = useState(false);
  const { isSignedIn } = useAuth();

  const modalContext = context ? {
    ...context,
    ...(CONTEXT_CONFIGS[context.iconType] || CONTEXT_CONFIGS.community)
  } : {
    ...DEFAULT_CONTEXT,
    ...CONTEXT_CONFIGS.community
  };

  // Close modal when user signs in
  useEffect(() => {
    if (isSignedIn && isOpen) {
      setIsLoading(false);
      onSuccess?.();
      onClose();
    }
  }, [isSignedIn, isOpen, onSuccess, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle sign in success
  const handleSignInSuccess = () => {
    setIsLoading(true);
    // Clerk will handle the redirect and update isSignedIn
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        
        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-slate-900/95 backdrop-blur-lg rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Section */}
          <div className={`relative p-6 pb-4 bg-gradient-to-br ${modalContext.color} text-white`}>
            {/* Decorative Background */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-full -translate-x-10 -translate-y-10" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-16 translate-y-16" />
            </div>
            
            <div className="relative text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 20 }}
                className="inline-flex items-center justify-center w-16 h-16 mb-4 text-3xl bg-white/20 backdrop-blur-sm rounded-full border border-white/30"
              >
                {modalContext.icon}
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-bold mb-2"
              >
                {modalContext.action}
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-white/90 text-sm"
              >
                {modalContext.description}
              </motion.p>
            </div>
          </div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="px-6 py-4 bg-slate-800/50"
          >
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              What you'll unlock:
            </h3>
            <ul className="space-y-2">
              {modalContext.benefits?.map((benefit, index) => (
                <motion.li
                  key={benefit}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-3 text-slate-300 text-sm"
                >
                  <div className="w-1.5 h-1.5 bg-pink-400 rounded-full flex-shrink-0" />
                  {benefit}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Auth Forms */}
          <div className="p-6">
            {/* Mode Toggle */}
            <div className="flex mb-6 bg-slate-800/50 rounded-lg p-1">
              <button
                onClick={() => setCurrentMode('signin')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
                  currentMode === 'signin'
                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setCurrentMode('signup')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
                  currentMode === 'signup'
                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Clerk Components */}
            <div className="relative">
              {isLoading && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full"
                  />
                </div>
              )}

              <AnimatePresence mode="wait">
                {currentMode === 'signin' ? (
                  <motion.div
                    key="signin"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SignIn
                      routing="hash"
                      redirectUrl={redirectUrl}
                      appearance={{
                        elements: {
                          rootBox: "w-full",
                          card: "bg-transparent shadow-none",
                          headerTitle: "hidden",
                          headerSubtitle: "hidden",
                          socialButtonsBlockButton: "bg-slate-800 border-slate-600 text-white hover:bg-slate-700",
                          formButtonPrimary: "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500",
                          formFieldInput: "bg-slate-800 border-slate-600 text-white",
                          formFieldLabel: "text-slate-300",
                          dividerLine: "bg-slate-600",
                          dividerText: "text-slate-400",
                          footerActionLink: "text-pink-400 hover:text-pink-300",
                          identityPreviewText: "text-slate-300",
                          identityPreviewEditButton: "text-pink-400",
                        },
                        layout: {
                          socialButtonsPlacement: "top",
                          socialButtonsVariant: "blockButton"
                        }
                      }}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="signup"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SignUp
                      routing="hash"
                      redirectUrl={redirectUrl}
                      appearance={{
                        elements: {
                          rootBox: "w-full",
                          card: "bg-transparent shadow-none",
                          headerTitle: "hidden",
                          headerSubtitle: "hidden",
                          socialButtonsBlockButton: "bg-slate-800 border-slate-600 text-white hover:bg-slate-700",
                          formButtonPrimary: "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500",
                          formFieldInput: "bg-slate-800 border-slate-600 text-white",
                          formFieldLabel: "text-slate-300",
                          dividerLine: "bg-slate-600",
                          dividerText: "text-slate-400",
                          footerActionLink: "text-pink-400 hover:text-pink-300",
                          identityPreviewText: "text-slate-300",
                          identityPreviewEditButton: "text-pink-400",
                        },
                        layout: {
                          socialButtonsPlacement: "top",
                          socialButtonsVariant: "blockButton"
                        }
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <div className="text-center">
              <p className="text-slate-400 text-xs">
                By continuing, you agree to our{' '}
                <a href="/terms" className="text-pink-400 hover:text-pink-300 underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-pink-400 hover:text-pink-300 underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
