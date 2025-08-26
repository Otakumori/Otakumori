/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '@/lib/hooks/useSound';
import { useHaptic } from '@/lib/hooks/useHaptic';

interface PhoneCallProps {
  character: {
    name: string;
    avatar: string;
    role: string;
  };
  messages: {
    text: string;
    type: 'incoming' | 'outgoing';
    delay?: number;
  }[];
  onComplete?: () => void;
}

export const PhoneCall = ({ character, messages, onComplete }: PhoneCallProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { playSound } = useSound();
  const { vibrate } = useHaptic();

  useEffect(() => {
    if (currentMessageIndex >= messages.length) {
      onComplete?.();
      return;
    }

    const message = messages[currentMessageIndex];
    setIsTyping(true);
    setDisplayedText('');

    let currentIndex = 0;
    const text = message.text;
    const delay = message.delay || 30;

    const typingInterval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(prev => prev + text[currentIndex]);
        currentIndex++;
        playSound('click');
        vibrate('light');
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);

        // Wait before showing next message
        setTimeout(() => {
          setCurrentMessageIndex(prev => prev + 1);
        }, 1000);
      }
    }, delay);

    return () => clearInterval(typingInterval);
  }, [currentMessageIndex, messages, onComplete, playSound, vibrate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="mx-4 w-full max-w-2xl rounded-2xl bg-gray-900 p-6 shadow-lg"
      >
        {/* Character Info */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-500/20">
            <span className="text-2xl">{character.avatar}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-pink-400">{character.name}</h2>
            <p className="text-white/70">{character.role}</p>
          </div>
        </div>

        {/* Message Display */}
        <div className="flex min-h-[200px] flex-col rounded-lg bg-black/50 p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMessageIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-white/90"
            >
              {displayedText}
              {isTyping && (
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="ml-1"
                >
                  ▋
                </motion.span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Indicator */}
        <div className="mt-4 flex justify-center gap-1">
          {messages.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${
                index === currentMessageIndex
                  ? 'bg-pink-500'
                  : index < currentMessageIndex
                    ? 'bg-pink-500/50'
                    : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
