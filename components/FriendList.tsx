// DEPRECATED: This component is a duplicate. Use app\components\FriendList.tsx instead.
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFriendStore } from '@/lib/store/friendStore';
import { useSound } from '@/lib/hooks/useSound';
import { useHaptic } from '@/lib/hooks/useHaptic';

export const FriendList = () => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const { friends, friendRequests, acceptFriendRequest, rejectFriendRequest, toggleFavorite } =
    useFriendStore();
  const { playSound } = useSound();
  const { vibrate } = useHaptic();

  const filteredFriends = friends.filter((friend) =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const pendingRequests = friendRequests.filter((request) => request.status === 'pending');

  const handleAcceptRequest = (requestId: string) => {
    acceptFriendRequest(requestId);
    playSound('success');
    vibrate('success');
  };

  const handleRejectRequest = (requestId: string) => {
    rejectFriendRequest(requestId);
    playSound('error');
    vibrate('error');
  };

  const handleToggleFavorite = (friendId: string) => {
    toggleFavorite(friendId);
    playSound('click');
    vibrate('light');
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-lg bg-white/10 p-4 shadow-lg backdrop-blur-lg">
      <div className="mb-4 flex space-x-4">
        <button
          className={`flex-1 rounded-lg px-4 py-2 transition-colors ${
            activeTab === 'friends' ? 'bg-pink-500 text-white' : 'bg-white/20 text-white'
          }`}
          onClick={() => setActiveTab('friends')}
        >
          Friends
          {pendingRequests.length > 0 && (
            <span className="ml-2 rounded-full bg-red-500 px-2 py-1 text-xs text-white">
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button
          className={`flex-1 rounded-lg px-4 py-2 transition-colors ${
            activeTab === 'requests' ? 'bg-pink-500 text-white' : 'bg-white/20 text-white'
          }`}
          onClick={() => setActiveTab('requests')}
        >
          Requests
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search friends..."
          className="w-full rounded-lg bg-white/20 px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'friends' ? (
          <motion.div
            key="friends"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-2"
          >
            {filteredFriends.map((friend) => (
              <motion.div
                key={friend.id}
                layout
                className="flex items-center justify-between rounded-lg bg-white/10 p-3"
              >
                <div className="flex items-center space-x-3">
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
                    <p className="font-medium text-white">{friend.username}</p>
                    <p className="text-sm text-white/50">
                      {friend.status === 'offline' && friend.lastSeen
                        ? `Last seen ${new Date(friend.lastSeen).toLocaleTimeString()}`
                        : friend.status}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleFavorite(friend.id)}
                  className="text-white/50 transition-colors hover:text-pink-500"
                >
                  {friend.favorite ? '' : ''}
                </button>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="requests"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-2"
          >
            {pendingRequests.map((request) => (
              <motion.div
                key={request.id}
                layout
                className="flex items-center justify-between rounded-lg bg-white/10 p-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500 text-white">
                    {request.fromUser.username[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-white">{request.fromUser.username}</p>
                    <p className="text-sm text-white/50">
                      {new Date(request.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAcceptRequest(request.id)}
                    className="rounded-lg bg-green-500 px-3 py-1 text-white transition-colors hover:bg-green-600"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request.id)}
                    className="rounded-lg bg-red-500 px-3 py-1 text-white transition-colors hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </motion.div>
            ))}
            {pendingRequests.length === 0 && (
              <p className="py-4 text-center text-white/50">No pending friend requests</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
