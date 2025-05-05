'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  content: string
  author: string
  created_at: string
  rating: number
}

export default function MessageManager() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchMessages()
  }, [filter])

  const fetchMessages = async () => {
    try {
      let query = supabase
        .from('soapstone_messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter === 'low-rated') {
        query = query.lt('rating', 3)
      } else if (filter === 'high-rated') {
        query = query.gte('rating', 4)
      }

      const { data, error } = await query
      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteMessage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('soapstone_messages')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      setMessages(messages.filter(msg => msg.id !== id))
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  const filteredMessages = messages.filter(msg => 
    msg.content.toLowerCase().includes(search.toLowerCase()) ||
    msg.author.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('low-rated')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'low-rated'
                ? 'bg-red-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Low Rated
          </button>
          <button
            onClick={() => setFilter('high-rated')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'high-rated'
                ? 'bg-green-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            High Rated
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-2">
        <AnimatePresence>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No messages found
            </div>
          ) : (
            filteredMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gray-800 p-4 rounded-lg border border-gray-700"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-pink-200">{message.content}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                      <span>By {message.author}</span>
                      <span>•</span>
                      <span>{new Date(message.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{'⭐'.repeat(message.rating)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMessage(message.id)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 