import { useFriendSystemStore, Friend } from '@/lib/store/friendSystemStore';
import { motion } from 'framer-motion';
import { AsciiArt } from './AsciiArt';

interface Activity {
  id: string;
  friendId: string;
  type: 'achievement' | 'game' | 'level';
  description: string;
  timestamp: Date;
}

export const FriendActivity = () => {
  const friends = useFriendSystemStore(state => state.friends);

  // Mock activities for demonstration
  const activities: Activity[] = friends.map((friend: Friend) => ({
    id: Math.random().toString(),
    friendId: friend.id,
    type: 'game',
    description: `${friend.username} played Petal Catch and scored 100 points!`,
    timestamp: new Date(),
  }));

  return (
    <div className="rounded-lg bg-white/10 p-6 shadow-lg backdrop-blur-lg">
      <div className="mb-6 flex items-center gap-4">
        <AsciiArt type="chat" className="text-2xl" />
        <h2 className="text-2xl font-bold text-pink-400">Activity Feed</h2>
      </div>
      <div className="space-y-4">
        {activities.map((activity: Activity, index: number) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-lg bg-white/5 p-4"
          >
            <p className="text-pink-400">{activity.description}</p>
            <p className="mt-2 text-sm text-gray-400">
              {new Date(activity.timestamp).toLocaleString()}
            </p>
          </motion.div>
        ))}
        {activities.length === 0 && <p className="text-center text-gray-400">No recent activity</p>}
      </div>
    </div>
  );
};
