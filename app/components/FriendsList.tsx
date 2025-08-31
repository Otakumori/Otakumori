'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import GlassCard from '@/app/components/ui/GlassCard';
import { FriendsPresenceResponse, PresenceResponse } from '@/app/lib/contracts';

interface FriendsListProps {
  className?: string;
}

export default function FriendsList({ className = '' }: FriendsListProps) {
  const { user } = useUser();
  const [friends, setFriends] = useState<PresenceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadFriends();
    }
  }, [user]);

  const loadFriends = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/v1/presence/friends');
      const result = await response.json();

      if (result.ok) {
        setFriends(result.data.friends);
      } else {
        console.error('Failed to load friends:', result.error);
      }
    } catch (error) {
      console.error('Friends load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'idle':
        return 'bg-yellow-500';
      case 'dnd':
        return 'bg-red-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'idle':
        return 'Away';
      case 'dnd':
        return 'Do Not Disturb';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <div className={className}>
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-pink-300">Friends</h2>
          <button
            onClick={loadFriends}
            className="text-pink-300/70 hover:text-pink-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-pink-300/70 mt-2 text-sm">Loading friends...</p>
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">👥</div>
            <p className="text-pink-300/70 text-sm">No friends yet</p>
            <p className="text-pink-300/50 text-xs mt-1">
              Start following people to see them here!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {friends.map((friend) => (
              <motion.div
                key={friend.profileId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 bg-pink-900/20 rounded-lg border border-pink-500/20 hover:bg-pink-900/30 transition-colors"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center text-pink-100 font-semibold">
                    {friend.profileId.charAt(0).toUpperCase()}
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(friend.status)} rounded-full border-2 border-pink-900`}
                  ></div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-pink-200 truncate">{friend.profileId}</p>
                    <span className="text-xs text-pink-300/70">{getStatusText(friend.status)}</span>
                  </div>

                  {friend.activity && friend.showActivity && (
                    <p className="text-xs text-green-400 truncate">
                      {friend.activity.game && `Playing ${friend.activity.game}`}
                      {friend.activity.page &&
                        !friend.activity.game &&
                        `Browsing ${friend.activity.page}`}
                    </p>
                  )}

                  {friend.status === 'offline' && (
                    <p className="text-xs text-pink-300/50">
                      Last seen {formatLastSeen(friend.lastSeen)}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
