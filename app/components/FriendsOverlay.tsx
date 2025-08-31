'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import GlassCard from '@/app/components/ui/GlassCard';
import GlassButton from '@/app/components/ui/GlassButton';

interface Friend {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  game?: string;
  lastSeen?: Date;
  isFavorite?: boolean;
}

interface FriendRequest {
  id: string;
  fromUser: Friend;
  timestamp: Date;
}

interface FriendsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FriendsOverlay({ isOpen, onClose }: FriendsOverlayProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load friends data from API
  useEffect(() => {
    if (isOpen) {
      loadFriendsData();
    }
  }, [isOpen]);

  const loadFriendsData = async () => {
    setIsLoading(true);
    try {
      // Load friends presence
      const friendsResponse = await fetch('/api/v1/presence/friends');
      const friendsResult = await friendsResponse.json();

      if (friendsResult.ok) {
        // Convert presence data to friend format
        const friendsData = friendsResult.data.friends.map((presence: any) => ({
          id: presence.profileId,
          username: presence.profileId, // This should be actual username from profile
          displayName: presence.profileId, // This should be actual display name
          status: presence.status,
          game: presence.activity?.game,
          lastSeen: new Date(presence.lastSeen),
          isFavorite: false,
        }));

        setFriends(friendsData);
      }

      // TODO: Load friend requests when that API is implemented
      setFriendRequests([]);
    } catch (error) {
      console.error('Failed to load friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: Friend['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: Friend['status']) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      case 'busy':
        return 'Busy';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    const request = friendRequests.find((req) => req.id === requestId);
    if (request) {
      setFriends((prev) => [...prev, request.fromUser]);
      setFriendRequests((prev) => prev.filter((req) => req.id !== requestId));
    }
  };

  const handleDeclineRequest = (requestId: string) => {
    setFriendRequests((prev) => prev.filter((req) => req.id !== requestId));
  };

  const handleToggleFavorite = (friendId: string) => {
    setFriends((prev) =>
      prev.map((friend) =>
        friend.id === friendId ? { ...friend, isFavorite: !friend.isFavorite } : friend,
      ),
    );
  };

  const filteredFriends = friends.filter(
    (friend) =>
      friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const onlineFriends = filteredFriends.filter((f) => f.status === 'online');
  const awayFriends = filteredFriends.filter((f) => f.status === 'away');
  const busyFriends = filteredFriends.filter((f) => f.status === 'busy');
  const offlineFriends = filteredFriends.filter((f) => f.status === 'offline');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-4xl max-h-[80vh] bg-gradient-to-br from-pink-900/90 to-purple-900/90 backdrop-blur-xl rounded-2xl border border-pink-500/20 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-pink-500/20">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-pink-300">Friends</h2>
              <div className="flex items-center gap-2 text-sm text-pink-200">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {onlineFriends.length} online
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-pink-300 hover:text-pink-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-pink-500/20">
            {[
              { id: 'friends', label: 'Friends', count: friends.length },
              { id: 'requests', label: 'Requests', count: friendRequests.length },
              { id: 'search', label: 'Search' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id ? 'text-pink-300' : 'text-pink-200/70 hover:text-pink-200'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-pink-500/20 text-pink-300 rounded-full">
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-400"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {activeTab === 'friends' && (
              <div className="space-y-6">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search friends..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 bg-pink-900/30 border border-pink-500/20 rounded-lg text-pink-100 placeholder-pink-300/50 focus:outline-none focus:border-pink-400"
                  />
                  <svg
                    className="absolute right-3 top-2.5 w-5 h-5 text-pink-300/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                {/* Friends List */}
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-2 border-pink-400 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-pink-300/70 mt-2">Loading friends...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Online Friends */}
                    {onlineFriends.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-pink-300 mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Online ({onlineFriends.length})
                        </h3>
                        <div className="space-y-2">
                          {onlineFriends.map((friend) => (
                            <FriendItem
                              key={friend.id}
                              friend={friend}
                              onToggleFavorite={handleToggleFavorite}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Away Friends */}
                    {awayFriends.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-pink-300 mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                          Away ({awayFriends.length})
                        </h3>
                        <div className="space-y-2">
                          {awayFriends.map((friend) => (
                            <FriendItem
                              key={friend.id}
                              friend={friend}
                              onToggleFavorite={handleToggleFavorite}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Busy Friends */}
                    {busyFriends.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-pink-300 mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          Busy ({busyFriends.length})
                        </h3>
                        <div className="space-y-2">
                          {busyFriends.map((friend) => (
                            <FriendItem
                              key={friend.id}
                              friend={friend}
                              onToggleFavorite={handleToggleFavorite}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Offline Friends */}
                    {offlineFriends.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-pink-300 mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                          Offline ({offlineFriends.length})
                        </h3>
                        <div className="space-y-2">
                          {offlineFriends.map((friend) => (
                            <FriendItem
                              key={friend.id}
                              friend={friend}
                              onToggleFavorite={handleToggleFavorite}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {filteredFriends.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-pink-300/70">No friends found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="space-y-4">
                {friendRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-pink-300/70">No pending friend requests</p>
                  </div>
                ) : (
                  friendRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 bg-pink-900/20 rounded-lg border border-pink-500/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center text-pink-100 font-semibold">
                          {request.fromUser.displayName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-pink-200">
                            {request.fromUser.displayName}
                          </h4>
                          <p className="text-sm text-pink-300/70">@{request.fromUser.username}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(request.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'search' && (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for users..."
                    className="w-full px-4 py-2 bg-pink-900/30 border border-pink-500/20 rounded-lg text-pink-100 placeholder-pink-300/50 focus:outline-none focus:border-pink-400"
                  />
                  <svg
                    className="absolute right-3 top-2.5 w-5 h-5 text-pink-300/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <div className="text-center py-8">
                  <p className="text-pink-300/70">Search functionality coming soon!</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface FriendItemProps {
  friend: Friend;
  onToggleFavorite: (friendId: string) => void;
}

function FriendItem({ friend, onToggleFavorite }: FriendItemProps) {
  const getStatusColor = (status: Friend['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-pink-900/20 rounded-lg border border-pink-500/20 hover:bg-pink-900/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center text-pink-100 font-semibold">
            {friend.displayName.charAt(0)}
          </div>
          <div
            className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(friend.status)} rounded-full border-2 border-pink-900`}
          ></div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-pink-200">{friend.displayName}</h4>
            {friend.isFavorite && <span className="text-yellow-400">★</span>}
          </div>
          <p className="text-sm text-pink-300/70">@{friend.username}</p>
          {friend.game && <p className="text-xs text-green-400">Playing {friend.game}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggleFavorite(friend.id)}
          className={`p-2 rounded-lg transition-colors ${
            friend.isFavorite
              ? 'text-yellow-400 hover:text-yellow-300'
              : 'text-pink-300/50 hover:text-yellow-400'
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
        <button className="p-2 text-pink-300/50 hover:text-pink-300 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
