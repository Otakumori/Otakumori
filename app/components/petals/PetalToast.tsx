'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

/**
 * PetalToast - Reusable UI feedback for petal gains
 * 
 * Shows a small "+N petals" notification when petals are granted.
 * Should be used consistently across the app for petal feedback.
 * 
 * Usage:
 * ```tsx
 * <PetalToast amount={grantedAmount} position="top-right" />
 * ```
 */
interface PetalToastProps {
  amount: number;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
  duration?: number; // milliseconds
  onComplete?: () => void;
}

export function PetalToast({
  amount,
  position = 'top-right',
  duration = 3000,
  onComplete,
}: PetalToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed ${positionClasses[position]} z-50 pointer-events-none`}
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -20, scale: 0.9 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -20, scale: 0.9 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeOut' }}
        >
          <div className="bg-gradient-to-r from-pink-500/90 to-purple-500/90 backdrop-blur-lg border border-white/20 rounded-lg px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-sm">+{amount}</span>
              <span className="text-white/80 text-xs">petals</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to trigger petal toast notifications
 * 
 * Usage:
 * ```tsx
 * const showPetalToast = usePetalToast();
 * 
 * // After granting petals:
 * showPetalToast(result.granted);
 * ```
 */
export function usePetalToast() {
  const [toasts, setToasts] = useState<Array<{ id: number; amount: number }>>([]);

  const showToast = (amount: number) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, amount }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    showToast,
    toasts: toasts.map((toast) => (
      <PetalToast
        key={toast.id}
        amount={toast.amount}
        onComplete={() => removeToast(toast.id)}
      />
    )),
  };
}

