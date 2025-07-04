'use client';
'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { RunicText } from './RunicText';

interface SoapstoneMessageProps {
  message: {
    id: string;
    content: string;
    author: string;
    created_at: string;
    rating: number;
  };
  onRate?: (id: string, rating: number) => void;
}

export default function SoapstoneMessage({ message, onRate }: SoapstoneMessageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [rating, setRating] = useState(message.rating);

  const handleRate = async (newRating: number) => {
    if (onRate) {
      onRate(message.id, newRating);
      setRating(newRating);
    }
  };

  return (
    <motion.div
      className="relative rounded-lg border border-pink-500/30 bg-gray-800/80 p-4 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Message Content */}
      <RunicText text={message.content} className="mb-2 font-medium text-pink-200" as="div" />

      {/* Author and Time */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <RunicText text={`By ${message.author}`} as="span" className="text-gray-400" />
        <RunicText
          text={new Date(message.created_at).toLocaleDateString()}
          as="span"
          className="text-gray-400"
        />
      </div>

      {/* Rating System */}
      <div className="mt-2 flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button key={star} onClick={() => handleRate(star)} className="text-xl">
            {star <= rating ? '⭐' : '☆'}
          </button>
        ))}
      </div>

      {/* Kawaii Effects */}
      {isHovered && (
        <motion.div
          className="absolute -right-2 -top-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
        >
          <span className="text-2xl">🌸</span>
        </motion.div>
      )}
    </motion.div>
  );
}
