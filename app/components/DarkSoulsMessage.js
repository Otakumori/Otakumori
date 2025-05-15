'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const runicSymbols = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛟ', 'ᛞ'];

export default function DarkSoulsMessage({ message, duration = 5000, onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [symbols, setSymbols] = useState([]);

  useEffect(() => {
    // Generate random runic symbols
    const generateSymbols = () => {
      const count = Math.floor(Math.random() * 3) + 2; // 2-4 symbols
      return Array.from({ length: count }, () => 
        runicSymbols[Math.floor(Math.random() * runicSymbols.length)]
      );
    };

    setSymbols(generateSymbols());

    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="relative">
            {/* Runic symbols above */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {symbols.map((symbol, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-yellow-400 text-xl"
                >
                  {symbol}
                </motion.span>
              ))}
            </div>

            {/* Message box */}
            <div className="bg-black/80 border-2 border-yellow-400/50 rounded-lg p-4 text-center">
              <p className="text-yellow-400 font-medieval text-lg">{message}</p>
            </div>

            {/* Runic symbols below */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {symbols.map((symbol, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-yellow-400 text-xl"
                >
                  {symbol}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 