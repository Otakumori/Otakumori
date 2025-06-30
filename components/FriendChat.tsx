'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFriendStore } from '../app/lib/store/friendStore';
import { useSound } from '../app/lib/hooks/useSound';
import { useHaptic } from '../app/lib/hooks/useHaptic';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
}

export const FriendChat = ({ friendId }: { friendId: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { friends } = useFriendStore();
  const { playSound } = useSound();
  const { vibrate } = useHaptic();

  const friend = friends.find(f => f.id === friendId);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: 'me', // In a real app, this would be the current user's ID
      content: newMessage,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    playSound('click');
    vibrate('light');

    // Simulate friend response
    setTimeout(() => {
      const response: Message = {
        id: Math.random().toString(36).substr(2, 9),
        senderId: friendId,
        content: 'Thanks for your message! This is a simulated response.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, response]);
      playSound('notification');
      vibrate('success');
    }, 1000);
  };

  if (!friend) return null;

  return (
    <div className="mx-auto w-full max-w-md rounded-lg bg-white/10 p-4 shadow-lg backdrop-blur-lg">
      <div className="mb-4 flex items-center space-x-3">
        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500 text-white">
            {friend.username[0].toUpperCase()}
          </div>
          <div
            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
              friend.status === 'online'
                ? 'bg-green-500'
                : friend.status === 'away'
                  ? 'bg-yellow-500'
                  : 'bg-gray-500'
            }`}
          />
        </div>
        <div>
          <h3 className="font-medium text-white">{friend.username}</h3>
          <p className="text-sm text-white/50">{friend.status}</p>
        </div>
      </div>

      <div className="mb-4 h-96 space-y-4 overflow-y-auto">
        {messages.map(message => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.senderId === 'me' ? 'bg-pink-500 text-white' : 'bg-white/20 text-white'
              }`}
            >
              <p>{message.content}</p>
              <p className="mt-1 text-xs opacity-50">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type a message..."
          className="flex-1 rounded-lg bg-white/20 px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        <button
          onClick={handleSendMessage}
          className="rounded-lg bg-pink-500 px-4 py-2 text-white transition-colors hover:bg-pink-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};
