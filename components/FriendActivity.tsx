'use client';
import { motion } from 'framer-motion';
import { useFriendStore } from '@/lib/store/friendStore';
import { useLeaderboardStore } from '@/lib/store/leaderboardStore';

interface Activity {
  id: string;
  type: 'achievement' | 'game' | 'friend';
  message: string;
  timestamp: number;
  friendId: string;
}

export const FriendActivity = () => {
  const { friends } = useFriendStore();
  const { entries } = useLeaderboardStore();

  // Generate activities from friend actions and game scores
  const friendActivities: Activity[] = friends.map(friend => ({
    id: `friend-${friend.id}-${Date.now()}`,
    type: 'friend' as const,
    message: `${friend.username} is now ${friend.status}`,
    timestamp: Date.now(),
    friendId: friend.id,
  }));

  // Get the latest 3 game activities
  const gameActivities: Activity[] = entries
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 3)
    .map(entry => ({
      id: `game-${entry.id}-${entry.timestamp}`,
      type: 'game' as const,
      message: `${entry.username ? entry.username : entry.id} scored ${entry.score} in ${entry.game}`,
      timestamp: entry.timestamp,
      friendId: entry.id,
    }));

  const activities: Activity[] = [...friendActivities, ...gameActivities].sort(
    (a, b) => b.timestamp - a.timestamp
  );

  return (
    <div className="mx-auto w-full max-w-md rounded-lg bg-white/10 p-4 shadow-lg backdrop-blur-lg">
      <h3 className="mb-4 text-xl font-semibold text-white">Friend Activity</h3>
      <div className="space-y-3">
        {activities.map(activity => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start space-x-3 rounded-lg bg-white/5 p-3"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-500 text-white">
              {activity.type === 'game' ? '🎮' : activity.type === 'achievement' ? '🏆' : '👥'}
            </div>
            <div className="flex-1">
              <p className="text-sm text-white">{activity.message}</p>
              <p className="text-xs text-white/50">
                {new Date(activity.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
