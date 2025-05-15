'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessage } from '@/app/context/MessageContext';
import { 
  getChatMessages, 
  sendChatMessage, 
  subscribeToChatMessages,
  deleteChatMessage,
  reportChatMessage 
} from './api/chat';

export default function AbyssCommunity() {
  const { data: session } = useSession();
  const { showMessage } = useMessage();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const subscriptionRef = useRef(null);

  // Mock data for forums
  const forums = [
    {
      id: 1,
      title: 'R18 Art Discussion',
      description: 'Share and discuss R18 artwork',
      posts: 156,
      lastActivity: '2 hours ago'
    },
    {
      id: 2,
      title: 'Collector\'s Corner',
      description: 'Show off your R18 merchandise collection',
      posts: 89,
      lastActivity: '5 hours ago'
    },
    {
      id: 3,
      title: 'Artist Showcase',
      description: 'Featured R18 artists and their work',
      posts: 234,
      lastActivity: '1 day ago'
    }
  ];

  useEffect(() => {
    if (activeTab === 'chat') {
      loadMessages();
      setupSubscription();
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [activeTab]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const chatMessages = await getChatMessages();
      setMessages(chatMessages.reverse());
      setError(null);
    } catch (err) {
      setError('Failed to load messages. Please try again.');
      showMessage('Failed to load messages. Try again, brave warrior.');
      console.error('Error loading messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const setupSubscription = () => {
    subscriptionRef.current = subscribeToChatMessages((message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
      if (message.author?.username) {
        showMessage(`${message.author.username} has joined the conversation`);
      }
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.user?.id) return;

    try {
      await sendChatMessage(session.user.id, newMessage.trim());
      setNewMessage('');
      showMessage('Message sent to the void');
    } catch (err) {
      setError('Failed to send message. Please try again.');
      showMessage('The message failed to reach its destination');
      console.error('Error sending message:', err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!session?.user?.id) return;

    try {
      await deleteChatMessage(messageId, session.user.id);
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      showMessage('Message erased from existence');
    } catch (err) {
      setError('Failed to delete message. Please try again.');
      showMessage('The message resists deletion');
      console.error('Error deleting message:', err);
    }
  };

  const handleReportMessage = async (messageId) => {
    if (!session?.user?.id) return;

    try {
      await reportChatMessage(messageId, session.user.id, 'Inappropriate content');
      showMessage('The message has been reported to the moderators');
    } catch (err) {
      setError('Failed to report message. Please try again.');
      showMessage('The report failed to reach the moderators');
      console.error('Error reporting message:', err);
    }
  };

  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold text-pink-500 mb-8">Abyss Community</h1>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'chat'
              ? 'bg-pink-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-pink-500'
          }`}
        >
          Live Chat
        </button>
        <button
          onClick={() => setActiveTab('forums')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'forums'
              ? 'bg-pink-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-pink-500'
          }`}
        >
          Forums
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/50 text-red-200 rounded-lg">
          {error}
        </div>
      )}

      {activeTab === 'chat' ? (
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          {/* Chat Messages */}
          <div className="h-[500px] overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-gray-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        {message.author?.avatar_url && (
                          <img
                            src={message.author.avatar_url}
                            alt={message.author.username}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <span className="font-bold text-pink-500">
                          {message.author?.username || 'Anonymous'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                        {session?.user?.id === message.author_id && (
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            ✕
                          </button>
                        )}
                        {session?.user?.id !== message.author_id && (
                          <button
                            onClick={() => handleReportMessage(message.id)}
                            className="text-gray-400 hover:text-yellow-500"
                          >
                            ⚠️
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-300">{message.content}</p>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </AnimatePresence>
            )}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
            <div className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                disabled={!session?.user}
              />
              <button
                type="submit"
                className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!session?.user || !newMessage.trim()}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forums.map((forum) => (
            <motion.div
              key={forum.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg p-6 shadow-xl"
            >
              <h2 className="text-xl font-bold text-pink-500 mb-2">{forum.title}</h2>
              <p className="text-gray-400 mb-4">{forum.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{forum.posts} posts</span>
                <span>Last activity: {forum.lastActivity}</span>
              </div>
              <button className="mt-4 w-full bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg">
                Enter Forum
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Community Guidelines */}
      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-bold text-pink-500 mb-2">Community Guidelines</h3>
        <ul className="text-gray-400 text-sm space-y-2">
          <li>• All content must be properly tagged and age-verified</li>
          <li>• Respect other community members</li>
          <li>• No sharing of unauthorized content</li>
          <li>• Report any violations to moderators</li>
        </ul>
      </div>
    </div>
  );
} 