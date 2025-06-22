'use client';
import React, { useState, useEffect } from 'react';
import { useFriendSystemStore, Friend } from '@/lib/store/friendSystemStore';
import { motion } from 'framer-motion';
import { AsciiArt } from './AsciiArt';

interface Activity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

export const FriendActivity: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockActivities: Activity[] = [
      {
        id: '1',
        user: 'AnimeFan123',
        action: 'unlocked an achievement',
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        user: 'OtakuMaster',
        action: 'posted in the community',
        timestamp: new Date(Date.now() - 600000).toISOString(),
      },
      {
        id: '3',
        user: 'WeebLife',
        action: 'added a new friend',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
    ];
    setTimeout(() => {
      setActivities(mockActivities);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="mb-4 h-4 w-1/4 rounded bg-gray-200"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
            <p className="text-pink-400">
              {activity.user} {activity.action}
            </p>
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
