'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

interface PetalSummary {
  balance: number;
  lifetimePetalsEarned: number;
  achievements: {
    count: number;
  };
}

/**
 * Quick stats card for profile left column
 * Shows joined date, rank/title, achievements count
 */
export default function ProfileStatsCard() {
  const { user, isSignedIn } = useUser();
  const [summary, setSummary] = useState<PetalSummary | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;

    async function fetchSummary() {
      try {
        const response = await fetch('/api/v1/petals/summary');
        if (response.ok) {
          const data = await response.json();
          if (data.ok && data.data) {
            setSummary(data.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch petal summary:', err);
      }
    }

    fetchSummary();
  }, [isSignedIn]);

  // Derive rank/title from lifetime petals
  const getRankTitle = (lifetime: number): string => {
    if (lifetime >= 100000) return 'Petal Master';
    if (lifetime >= 50000) return 'Blossom Legend';
    if (lifetime >= 25000) return 'Cherry Sage';
    if (lifetime >= 10000) return 'Petal Warrior';
    if (lifetime >= 5000) return 'Blossom Seeker';
    if (lifetime >= 1000) return 'Petal Initiate';
    return 'Wanderer';
  };

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : null;

  const rankTitle = summary ? getRankTitle(summary.lifetimePetalsEarned) : 'Wanderer';
  const achievementCount = summary?.achievements.count || 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Stats</h3>

      <div className="space-y-4">
        {/* Joined Date */}
        {joinedDate && (
          <div>
            <div className="text-xs text-zinc-400 mb-1">Joined</div>
            <div className="text-sm text-white">{joinedDate}</div>
          </div>
        )}

        {/* Rank/Title */}
        <div>
          <div className="text-xs text-zinc-400 mb-1">Rank</div>
          <div className="text-sm font-semibold text-pink-300">{rankTitle}</div>
        </div>

        {/* Achievements */}
        <div>
          <div className="text-xs text-zinc-400 mb-1">Achievements</div>
          <div className="text-sm text-white">
            {isSignedIn ? `${achievementCount} unlocked` : '—'}
          </div>
        </div>
      </div>
    </div>
  );
}

