'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface SoapstoneMessageProps {
  message: {
    id: string
    content: string
    author: string
    created_at: string
    rating: number
  }
  onRate?: (id: string, rating: number) => void
}

export default function SoapstoneMessage({ message, onRate }: SoapstoneMessageProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [rating, setRating] = useState(message.rating)

  const handleRate = async (newRating: number) => {
    if (onRate) {
      onRate(message.id, newRating)
      setRating(newRating)
    }
  }

  return (
    <motion.div
      className="relative bg-gray-800/80 p-4 rounded-lg border border-pink-500/30 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Message Content */}
      <div className="text-pink-200 font-medium mb-2">
        {message.content}
      </div>
      
      {/* Author and Time */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>By {message.author}</span>
        <span>{new Date(message.created_at).toLocaleDateString()}</span>
      </div>

      {/* Rating System */}
      <div className="mt-2 flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            className="text-xl"
          >
            {star <= rating ? '⭐' : '☆'}
          </button>
        ))}
      </div>

      {/* Kawaii Effects */}
      {isHovered && (
        <motion.div
          className="absolute -top-2 -right-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
        >
          <span className="text-2xl">🌸</span>
        </motion.div>
      )}
    </motion.div>
  )
} 