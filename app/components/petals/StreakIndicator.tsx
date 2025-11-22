'use client';

import { type StreakData } from '@/app/lib/petal-streaks';
import { getStreakMultiplier } from '@/app/lib/petal-streaks';

interface StreakIndicatorProps {
  streak: StreakData;
  showMultiplier?: boolean;
}

/**
 * Visual indicator showing current streak and multiplier
 */
export function StreakIndicator({ streak, showMultiplier = true }: StreakIndicatorProps) {
  const multiplier = getStreakMultiplier(streak.currentStreak);
  const hasBonus = multiplier > 1.0;

  return (
    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-2xl" role="img" aria-label="Fire">
          🔥
        </span>
        <div>
          <div className="text-sm text-white/60">Streak</div>
          <div className="text-xl font-bold text-pink-300">
            {streak.currentStreak} {streak.currentStreak === 1 ? 'day' : 'days'}
          </div>
        </div>
      </div>

      {showMultiplier && hasBonus && (
        <div className="flex items-center gap-2 pl-4 border-l border-white/20">
          <span className="text-sm text-white/60">Bonus</span>
          <span className="text-lg font-semibold text-emerald-300">
            +{Math.round((multiplier - 1) * 100)}%
          </span>
        </div>
      )}

      {streak.longestStreak > streak.currentStreak && (
        <div className="text-xs text-white/40 ml-auto">Best: {streak.longestStreak} days</div>
      )}
    </div>
  );
}

/**
 * Streak recovery prompt component
 */
export function StreakRecoveryPrompt({
  brokenStreak,
  recoveryCost,
  onRecover,
  onDismiss,
}: {
  brokenStreak: number;
  recoveryCost: number;
  onRecover: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-lg border border-amber-500/30 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <span className="text-3xl" role="img" aria-label="Warning">
          ⚠️
        </span>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-amber-300 mb-2">Streak Broken!</h3>
          <p className="text-white/90 mb-4">
            Your {brokenStreak}-day streak was broken. Restore it for {recoveryCost} petals?
          </p>
          <div className="flex gap-3">
            <button
              onClick={onRecover}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Restore ({recoveryCost} petals)
            </button>
            <button
              onClick={onDismiss}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Start Fresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
