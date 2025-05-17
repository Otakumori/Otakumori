'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { RealtimeChannel } from '@supabase/supabase-js';

export default function AbyssCommunity() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const supabase = createClientComponentClient();
  const channelRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (status === 'authenticated' && session?.user) {
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('abyss_verified')
          .eq('user_id', session.user.id)
          .single();

        if (!preferences?.abyss_verified) {
          router.push('/abyss');
          return;
        }
      } else {
        router.push('/auth/signin');
        return;
      }
    };

    checkAccess();
  }, [status, session, router, supabase]);

  useEffect(() => {
    const setupRealtime = async () => {
      // Subscribe to messages
      channelRef.current = supabase
        .channel('abyss_chat')
        .on('presence', { event: 'sync' }, () => {
          const presenceState = channelRef.current.presenceState();
          setOnlineUsers(Object.keys(presenceState).length);
        })
        .on('broadcast', { event: 'message' }, ({ payload }) => {
          setMessages(prev => [...prev, payload]);
        })
        .subscribe(async status => {
          if (status === 'SUBSCRIBED') {
            await channelRef.current.track({ user_id: session?.user?.id });
          }
        });

      // Fetch recent messages
      const { data: recentMessages, error } = await supabase
        .from('abyss_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(recentMessages.reverse());
      }

      setIsLoading(false);
    };

    if (session?.user) {
      setupRealtime();
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [session, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async e => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.user) return;

    const message = {
      user_id: session.user.id,
      username: session.user.name || 'Anonymous',
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from('abyss_messages').insert([message]);

      if (error) throw error;

      channelRef.current?.send({
        type: 'broadcast',
        event: 'message',
        payload: message,
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-16 w-16 rounded-full border-4 border-pink-500 border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-pink-500"
            >
              Abyss Community
            </motion.h1>
            <div className="rounded-full bg-gray-900 px-4 py-2">
              <span className="font-bold text-pink-500">{onlineUsers}</span> online
            </div>
          </div>

          <div className="mb-4 h-[600px] overflow-y-auto rounded-lg bg-gray-900 p-4 shadow-xl">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 ${message.user_id === session?.user?.id ? 'text-right' : ''}`}
              >
                <div
                  className={`inline-block max-w-[70%] ${
                    message.user_id === session?.user?.id ? 'bg-pink-600' : 'bg-gray-800'
                  } rounded-lg p-3`}
                >
                  <div className="mb-1 text-sm text-gray-400">{message.username}</div>
                  <div>{message.content}</div>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-4">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-lg bg-gray-900 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="rounded-lg bg-pink-600 px-6 py-2 font-bold text-white hover:bg-pink-700"
            >
              Send
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
