'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock, Star } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'star';
  unlocked: boolean;
  progress?: number;
}

const achievements: Achievement[] = [
  {
    id: 'first-purchase',
    title: 'First Purchase',
    description: 'Make your first purchase in the shop',
    icon: 'trophy',
    unlocked: false,
  },
  {
    id: 'shop-master',
    title: 'Shop Master',
    description: 'Purchase 10 different items',
    icon: 'trophy',
    unlocked: false,
    progress: 0,
  },
  {
    id: 'wishlist-collector',
    title: 'Wishlist Collector',
    description: 'Add 5 items to your wishlist',
    icon: 'star',
    unlocked: false,
    progress: 0,
  },
  {
    id: 'early-adopter',
    title: 'Early Adopter',
    description: 'Join during the beta phase',
    icon: 'trophy',
    unlocked: true,
  },
];

export default function Achievements() {
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {achievements.map((achievement) => (
        <motion.div
          key={achievement.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          className={`relative overflow-hidden rounded-lg border p-6 ${
            achievement.unlocked
              ? 'border-pink-200 bg-white'
              : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {achievement.icon === 'trophy' ? (
                <Trophy
                  className={`h-6 w-6 ${
                    achievement.unlocked ? 'text-pink-500' : 'text-gray-400'
                  }`}
                />
              ) : (
                <Star
                  className={`h-6 w-6 ${
                    achievement.unlocked ? 'text-pink-500' : 'text-gray-400'
                  }`}
                />
              )}
              <div>
                <h3 className="font-medium text-gray-900">{achievement.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{achievement.description}</p>
              </div>
            </div>
            {!achievement.unlocked && (
              <Lock className="h-5 w-5 text-gray-400" />
            )}
          </div>
          {achievement.progress !== undefined && (
            <div className="mt-4">
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-pink-500 transition-all duration-300"
                  style={{ width: `${achievement.progress}%` }}
                />
              </div>
              <p className="mt-1 text-right text-sm text-gray-500">
                {achievement.progress}%
              </p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
