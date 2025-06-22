'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SoapstoneMessageProps {
  message: string;
  duration?: number;
  position?: 'top' | 'bottom' | 'center';
  type?: 'praise' | 'warning' | 'help' | 'invasion';
}

const SoapstoneMessage: React.FC<SoapstoneMessageProps> = ({
  message,
  duration = 5000,
  position = 'center',
  type = 'praise',
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return 'top-4';
      case 'bottom':
        return 'bottom-4';
      default:
        return 'top-1/2 -translate-y-1/2';
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return 'bg-red-900/90 text-red-100';
      case 'help':
        return 'bg-blue-900/90 text-blue-100';
      case 'invasion':
        return 'bg-purple-900/90 text-purple-100';
      default:
        return 'bg-yellow-900/90 text-yellow-100';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed left-1/2 -translate-x-1/2 ${getPositionStyles()} z-50`}
        >
          <div
            className={`${getTypeStyles()} transform cursor-pointer select-none rounded-lg border border-white/20 px-6 py-3 font-medieval text-lg tracking-wider shadow-lg backdrop-blur-sm transition-transform duration-300 hover:scale-105`}
            onClick={() => setIsVisible(false)}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">✧</span>
              <span>{message}</span>
              <span className="text-2xl">✧</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SoapstoneMessage;
