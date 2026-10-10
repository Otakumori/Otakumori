'use client';

import { logger } from '@/app/lib/logger';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

interface PetalSummary {
  balance: number;
  lifetimePetalsEarned: number;
  todayEarned: number;
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
        logger.error(
          'Failed to fetch petal summary:',
          undefined,
          undefined,
          err instanceof Error ? err : new Error(String(err)),
        );
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
    <section className="commander-material-region" aria-labelledby="profile-record-heading">
      <h2 id="profile-record-heading" className="font-display text-xl text-[#fff1e4]">
        Record
      </h2>

      <dl className="commander-stat-list">
        {joinedDate && (
          <div>
            <dt>Joined</dt>
            <dd>{joinedDate}</dd>
          </div>
        )}

        <div>
          <dt>Rank</dt>
          <dd>{rankTitle}</dd>
        </div>

        <div>
          <dt>Achievements</dt>
          <dd>{isSignedIn ? `${achievementCount} unlocked` : '—'}</dd>
        </div>

        {summary && (
          <div>
            <dt>Lifetime petals</dt>
            <dd>{summary.lifetimePetalsEarned.toLocaleString()}</dd>
          </div>
        )}

        {summary && (
          <div>
            <dt>Today&apos;s petals</dt>
            <dd>{summary.todayEarned.toLocaleString()}</dd>
          </div>
        )}
      </dl>
    </section>
  );
}
