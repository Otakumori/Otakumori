'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SoapstoneForm() {
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('You must be signed in to leave a message')
      }

      const { error } = await supabase
        .from('soapstone_messages')
        .insert([
          {
            content: message,
            author: user.email,
            rating: 0
          }
        ])

      if (error) throw error

      setMessage('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave message')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Leave your message, Ashen One..."
          className="w-full h-32 bg-gray-800/80 border border-pink-500/30 rounded-lg p-4 text-pink-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          maxLength={200}
        />
        <div className="absolute bottom-2 right-2 text-sm text-gray-500">
          {message.length}/200
        </div>
      </div>

      {error && (
        <div className="text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !message.trim()}
        className="w-full py-2 px-4 bg-pink-600 hover:bg-pink-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Carving...' : 'Carve Message'}
      </button>
    </form>
  )
} 