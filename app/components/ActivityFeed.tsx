'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import GlassCard from '@/app/components/ui/GlassCard';
import { ActivityFeedResponse, Activity } from '@/app/lib/contracts';

interface ActivityFeedProps {
  className?: string;
  scope?: 'global' | 'friends' | 'user';
  type?: string;
  limit?: number;
}

export default function ActivityFeed({
  className = '',
  scope = 'friends',
  type,
  limit = 20,
}: ActivityFeedProps) {
  const { user } = useUser();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();

  useEffect(() => {
    if (user) {
      loadActivities();
    }
  }, [user, scope, type]);

  const loadActivities = async (cursor?: string) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        scope,
        limit: limit.toString(),
      });

      if (type) params.append('type', type);
      if (cursor) params.append('cursor', cursor);

      const response = await fetch(`/api/v1/feed?${params}`);
      const result = await response.json();

      if (result.ok) {
        if (cursor) {
          setActivities((prev) => [...prev, ...result.data.activities]);
        } else {
          setActivities(result.data.activities);
        }
        setHasMore(result.data.hasMore);
        setNextCursor(result.data.nextCursor);
      } else {
        console.error('Failed to load activities:', result.error);
      }
    } catch (error) {
      console.error('Activity feed error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && nextCursor && !isLoading) {
      loadActivities(nextCursor);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return '🏆';
      case 'score':
        return '🎯';
      case 'purchase':
        return '🛒';
      case 'unlock':
        return '🔓';
      case 'trade':
        return '🔄';
      case 'follow':
        return '👥';
      default:
        return '📢';
    }
  };

  const getActivityText = (activity: Activity) => {
    const payload = activity.payload as any;

    switch (activity.type) {
      case 'achievement':
        return `Unlocked achievement: ${payload.name || 'New Achievement'}`;
      case 'score':
        return `Scored ${payload.score} in ${payload.gameCode || 'a game'}`;
      case 'purchase':
        return `Purchased ${payload.itemName || 'an item'}`;
      case 'unlock':
        return `Unlocked ${payload.itemName || 'new content'}`;
      case 'trade':
        return `Traded ${payload.itemName || 'items'}`;
      case 'follow':
        return `Started following ${payload.targetUsername || 'someone'}`;
      default:
        return 'New activity';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-pink-300">Activity Feed</h2>
          <div className="flex items-center gap-2">
            <select
              value={scope}
              onChange={(e) => {
                const newScope = e.target.value as 'global' | 'friends' | 'user';
                setActivities([]);
                setNextCursor(undefined);
                loadActivities();
              }}
              className="px-3 py-1 bg-pink-900/30 border border-pink-500/20 rounded-lg text-pink-100 text-sm"
            >
              <option value="friends">Friends</option>
              <option value="global">Global</option>
              <option value="user">My Activity</option>
            </select>
          </div>
        </div>

        {isLoading && activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-pink-300/70 mt-2 text-sm">Loading activities...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📢</div>
            <p className="text-pink-300/70 text-sm">No activities yet</p>
            <p className="text-pink-300/50 text-xs mt-1">
              Start playing games to see activity here!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-start gap-3 p-4 bg-pink-900/20 rounded-lg border border-pink-500/20 hover:bg-pink-900/30 transition-colors"
                >
                  <div className="text-2xl">{getActivityIcon(activity.type)}</div>

                  <div className="flex-1 min-w-0">
                    <p className="text-pink-100 text-sm leading-relaxed">
                      {getActivityText(activity)}
                    </p>
                    <p className="text-pink-300/50 text-xs mt-1">
                      {formatTimeAgo(activity.createdAt)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="px-4 py-2 bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/20 rounded-lg text-pink-300 text-sm transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
