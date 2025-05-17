'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  content: string;
  author: string;
  created_at: string;
  rating: number;
}

export default function MessageManager() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    try {
      let query = supabase
        .from('soapstone_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'low-rated') {
        query = query.lt('rating', 3);
      } else if (filter === 'high-rated') {
        query = query.gte('rating', 4);
      }

      const { data, error } = await query;
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const { error } = await supabase.from('soapstone_messages').delete().eq('id', id);

      if (error) throw error;
      setMessages(messages.filter(msg => msg.id !== id));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const filteredMessages = messages.filter(
    msg =>
      msg.content.toLowerCase().includes(search.toLowerCase()) ||
      msg.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-lg px-4 py-2 transition-colors ${
              filter === 'all'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('low-rated')}
            className={`rounded-lg px-4 py-2 transition-colors ${
              filter === 'low-rated'
                ? 'bg-red-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Low Rated
          </button>
          <button
            onClick={() => setFilter('high-rated')}
            className={`rounded-lg px-4 py-2 transition-colors ${
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
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-pink-500"></div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="py-8 text-center text-gray-400">No messages found</div>
          ) : (
            filteredMessages.map(message => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-lg border border-gray-700 bg-gray-800 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-pink-200">{message.content}</p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                      <span>By {message.author}</span>
                      <span>•</span>
                      <span>{new Date(message.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{'⭐'.repeat(message.rating)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMessage(message.id)}
                    className="p-2 text-red-400 transition-colors hover:text-red-300"
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
  );
}
