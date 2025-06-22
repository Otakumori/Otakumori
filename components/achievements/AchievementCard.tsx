import React from 'react';
import { motion } from 'framer-motion';
import { Achievement } from '@/app/types/achievements';
import { useAchievements } from '@/app/contexts/AchievementContext';

interface AchievementCardProps {
  achievement: Achievement;
}

export default function AchievementCard({ achievement }: AchievementCardProps) {
  const { getAchievementProgress } = useAchievements();
  const progress = getAchievementProgress(achievement.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-lg p-4 backdrop-blur-sm ${
        achievement.isUnlocked
          ? 'border border-pink-500/30 bg-pink-500/20'
          : 'border border-gray-700/50 bg-gray-800/50'
      }`}
    >
      {/* Achievement Icon */}
      <div className="relative mb-4 h-16 w-16">
        <img
          src={achievement.icon}
          alt={achievement.name}
          className={`h-full w-full object-contain ${
            achievement.isUnlocked ? 'opacity-100' : 'opacity-50 grayscale'
          }`}
        />
        {achievement.isUnlocked && (
          <div className="absolute inset-0 animate-pulse rounded-full bg-pink-500/20" />
        )}
      </div>

      {/* Achievement Info */}
      <h3 className="mb-2 text-lg font-semibold">{achievement.name}</h3>
      <p className="mb-4 text-sm text-gray-300">{achievement.description}</p>

      {/* Progress Bar */}
      {!achievement.isUnlocked && (
        <div className="mb-2 h-2 w-full rounded-full bg-gray-700">
          <div
            className="h-2 rounded-full bg-pink-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Reward Info */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-pink-400">{achievement.reward.petals} petals</span>
        {achievement.reward.customReward && (
          <span className="text-pink-300">{achievement.reward.customReward}</span>
        )}
      </div>

      {/* Unlock Date */}
      {achievement.isUnlocked && achievement.unlockedAt && (
        <div className="mt-2 text-xs text-gray-400">
          Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
        </div>
      )}
    </motion.div>
  );
}
