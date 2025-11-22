'use client';

import { useEffect, useState } from 'react';
import { getRewardProgress, type PetalReward } from '@/app/lib/petal-economy';
import Link from 'next/link';
import { paths } from '@/lib/paths';

interface PetalRewardNotificationProps {
  currentPetals: number;
  onDismiss?: () => void;
}

/**
 * Floating notification that appears when user reaches a petal reward threshold
 */
export function PetalRewardNotification({
  currentPetals,
  onDismiss,
}: PetalRewardNotificationProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [unlockedReward, setUnlockedReward] = useState<PetalReward | null>(null);
  const [hasShownForThreshold, setHasShownForThreshold] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Check if user just reached a new threshold
    const rewards = [
      {
        threshold: 100,
        reward: {
          threshold: 100,
          type: 'discount' as const,
          value: 5,
          description: '5% off your next purchase',
        },
      },
      {
        threshold: 500,
        reward: {
          threshold: 500,
          type: 'unlock' as const,
          value: 'exclusive-avatar',
          description: 'Unlock exclusive avatar',
        },
      },
      {
        threshold: 1000,
        reward: {
          threshold: 1000,
          type: 'exclusive' as const,
          value: 'early-access',
          description: 'Early access to new games',
        },
      },
      {
        threshold: 2500,
        reward: {
          threshold: 2500,
          type: 'badge' as const,
          value: 'petal-master',
          description: 'Petal Master badge',
        },
      },
    ];

    for (const { threshold, reward } of rewards) {
      if (
        currentPetals >= threshold &&
        !hasShownForThreshold.has(threshold) &&
        currentPetals < threshold + 10 // Only show if just reached (within 10 petals)
      ) {
        setUnlockedReward(reward);
        setShowNotification(true);
        setHasShownForThreshold((prev) => new Set(prev).add(threshold));

        // Auto-dismiss after 5 seconds
        const timer = setTimeout(() => {
          setShowNotification(false);
        }, 5000);

        return () => clearTimeout(timer);
      }
    }
  }, [currentPetals, hasShownForThreshold]);

  if (!showNotification || !unlockedReward) {
    return null;
  }

  const getRewardAction = () => {
    switch (unlockedReward.type) {
      case 'discount':
        return { label: 'Claim Discount', href: paths.shop() };
      case 'unlock':
        return { label: 'View Avatar', href: '/avatar/editor' };
      case 'exclusive':
        return { label: 'Explore Games', href: paths.games() };
      case 'badge':
        return { label: 'View Profile', href: '/profile' };
      default:
        return { label: 'View Rewards', href: '/rewards' };
    }
  };

  const action = getRewardAction();

  return (
    <div
      className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in"
      role="alert"
      aria-live="polite"
    >
      <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-lg border border-pink-500/30 rounded-2xl p-6 shadow-lg max-w-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl" role="img" aria-label="Celebration">
                🎉
              </span>
              <h3 className="text-lg font-bold text-pink-300">Reward Unlocked!</h3>
            </div>
            <p className="text-white/90 mb-1">
              You've collected {unlockedReward.threshold} petals!
            </p>
            <p className="text-sm text-pink-200/80 mb-4">{unlockedReward.description}</p>
            <Link
              href={action.href}
              className="inline-block bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              onClick={() => {
                setShowNotification(false);
                onDismiss?.();
              }}
            >
              {action.label}
            </Link>
          </div>
          <button
            onClick={() => {
              setShowNotification(false);
              onDismiss?.();
            }}
            className="text-white/60 hover:text-white transition-colors"
            aria-label="Dismiss notification"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Progress indicator showing progress toward next reward
 */
export function PetalRewardProgress({ currentPetals }: { currentPetals: number }) {
  const { progress, nextReward, petalsNeeded } = getRewardProgress(currentPetals);

  if (!nextReward) {
    return (
      <div className="text-center py-4">
        <p className="text-pink-300 font-semibold">
          All rewards unlocked!{' '}
          <span role="img" aria-label="Celebration">
            🎉
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/70">Next Reward: {nextReward.description}</span>
        <span className="text-pink-300 font-medium">{petalsNeeded} petals needed</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
