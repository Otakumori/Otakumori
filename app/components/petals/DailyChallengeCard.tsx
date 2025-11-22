'use client';

import { type DailyChallenge } from '@/app/lib/petal-challenges';
import { isChallengeCompleted } from '@/app/lib/petal-challenges';

interface DailyChallengeCardProps {
  challenge: DailyChallenge;
  onClaim?: (challengeId: string) => void;
}

/**
 * Card displaying a daily challenge with progress
 */
export function DailyChallengeCard({ challenge, onClaim }: DailyChallengeCardProps) {
  const completed = isChallengeCompleted(challenge);
  const progress = Math.min(challenge.progress / challenge.target, 1);

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{challenge.title}</h3>
          <p className="text-sm text-white/70">{challenge.description}</p>
        </div>
        {completed && (
          <span className="text-2xl" role="img" aria-label="Completed">
            ✅
          </span>
        )}
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-white/60">
            {challenge.progress} / {challenge.target}
          </span>
          <span className="text-pink-300 font-medium">+{challenge.reward.petals} petals</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {challenge.reward.achievement && (
        <p className="text-xs text-pink-200/80 mb-3">
          + Achievement: {challenge.reward.achievement}
        </p>
      )}

      {completed && (
        <button
          onClick={() => onClaim?.(challenge.id)}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Claim Reward
        </button>
      )}

      <p className="text-xs text-white/40 mt-2">
        Expires: {challenge.expiresAt.toLocaleDateString()}
      </p>
    </div>
  );
}
