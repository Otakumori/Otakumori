import { motion } from "framer-motion";

import type { Achievement } from "./AchievementProvider";
import { useAchievements } from "./AchievementProvider";

interface AchievementCardProps {
  achievement: Achievement;
}

const isImageSource = (value: string) => value.startsWith("/") || value.startsWith("http");

const rewardLabel = (achievement: Achievement) => {
  if (!achievement.reward) {
    return "";
  }

  if (achievement.reward.type === "points") {
    return `${achievement.reward.value} Points`;
  }

  if (achievement.reward.type === "discount") {
    return `${achievement.reward.value}% Discount`;
  }

  return String(achievement.reward.value);
};

export function AchievementCard({ achievement }: AchievementCardProps) {
  const { unlockAchievement } = useAchievements();
  const { progress, total, unlocked } = achievement;
  const ratio = total > 0 ? Math.min(100, Math.round((progress / total) * 100)) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={[
        "rounded-lg bg-white p-6 shadow-lg transition-opacity dark:bg-gray-800",
        !unlocked ? "opacity-80" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start space-x-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-100 text-2xl">
          {isImageSource(achievement.icon) ? (
            <img
              src={achievement.icon}
              alt="Achievement icon"
              className={[
                "h-full w-full rounded-lg object-cover",
                !unlocked ? "grayscale" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            />
          ) : (
            <span className={!unlocked ? "opacity-70" : undefined}>{achievement.icon}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-medium text-gray-900 dark:text-white">
            {achievement.title}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Progress: {progress} / {total}
          </p>
          <p className="mt-2 line-clamp-2 text-sm text-gray-700 dark:text-gray-300">
            {achievement.description}
          </p>
        </div>
      </div>

      {!unlocked && total > 0 && (
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Progress</span>
            <span>{ratio}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${ratio}%` }}
              className="h-1.5 rounded-full bg-indigo-600"
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
        <span>{rewardLabel(achievement)}</span>
        {unlocked ? (
          <span className="text-xs uppercase tracking-wide text-green-500">Unlocked</span>
        ) : (
          <button
            type="button"
            className="text-xs uppercase tracking-wide text-pink-500 hover:text-pink-400"
            onClick={() => unlockAchievement(achievement.id)}
          >
            Mark as unlocked
          </button>
        )}
      </div>
    </motion.div>
  );
}