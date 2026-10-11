'use client';

import { logger } from '@/app/lib/logger';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

interface PetalSummary {
  balance: number;
  lifetimePetalsEarned: number;
  todayEarned: number;
  dailyCapReached: boolean;
  achievements: {
    count: number;
    petalsEarned: number;
  };
  cosmetics?: {
    totalOwned: number;
    hudSkins: number;
    avatarCosmetics: number;
  };
  vouchers?: {
    activeCount: number;
  };
}

export default function RewardsSummary() {
  const { isSignedIn } = useUser();
  const [summary, setSummary] = useState<PetalSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    async function fetchSummary() {
      try {
        const response = await fetch('/api/v1/petals/summary');
        if (!response.ok) {
          throw new Error('Failed to fetch petal summary');
        }
        const data = await response.json();
        if (data.ok && data.data) {
          setSummary(data.data);
        } else {
          throw new Error(data.error || 'Failed to load summary');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        logger.error(
          'Error fetching petal summary:',
          undefined,
          undefined,
          err instanceof Error ? err : new Error(String(err)),
        );
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [isSignedIn]);

  if (!isSignedIn) {
    return (
      <section className="commander-material-region">
        <h2 className="font-display text-xl text-[#fff1e4]">Your Petal Rewards</h2>
        <div className="py-6">
          <p className="text-[#d9cdbd]">
            Sign in to save your petals and track your lifetime total.
          </p>
          <p className="mt-2 text-sm text-[#9f928a]">
            Your progress will be saved and you can unlock achievements!
          </p>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="commander-material-region" aria-busy="true">
        <h2 className="font-display text-xl text-[#fff1e4]">Your Petal Rewards</h2>
        <div className="py-6" role="status">
          <div className="text-[#9f928a]">Loading your rewards…</div>
        </div>
      </section>
    );
  }

  if (error || !summary) {
    return (
      <section className="commander-material-region">
        <h2 className="font-display text-xl text-[#fff1e4]">Your Petal Rewards</h2>
        <div className="py-6" role="status">
          <p className="text-[#d69a92]">Rewards are temporarily unavailable.</p>
          <p className="mt-2 text-sm text-[#9f928a]">Please try again later.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="commander-material-region">
      <h2 className="font-display text-xl text-[#fff1e4]">Your Petal Rewards</h2>

      <div className="commander-record-grid mt-5">
        <div className="commander-record-cell">
          <div className="commander-record-cell__label">Current balance</div>
          <div className="commander-record-cell__value">{summary.balance.toLocaleString()}</div>
          <div className="mt-1 text-xs text-[#9f928a]">Available to spend</div>
        </div>

        <div className="commander-record-cell">
          <div className="commander-record-cell__label">Lifetime earned</div>
          <div className="commander-record-cell__value">
            {summary.lifetimePetalsEarned.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-[#9f928a]">Total all-time</div>
        </div>
      </div>

      <div className="mt-6 border-t border-[#896f48]/20 pt-5">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-[#d9cdbd]">Today&apos;s earnings</div>
          {summary.dailyCapReached && (
            <span className="text-xs text-[#e0b76a]">Daily Cap Reached</span>
          )}
        </div>
        <div className="mt-2 text-2xl text-[#fff1e4]">{summary.todayEarned.toLocaleString()}</div>
        <div className="mt-1 text-xs text-[#9f928a]">Petals earned today</div>
      </div>

      <div className="mt-6 border-t border-[#896f48]/20 pt-5">
        <div className="mb-2 text-sm text-[#d9cdbd]">Achievements</div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-xl text-[#fff1e4]">{summary.achievements.count}</div>
            <div className="text-xs text-[#9f928a]">Unlocked</div>
          </div>
          <div>
            <div className="text-xl text-[#fff1e4]">
              {summary.achievements.petalsEarned.toLocaleString()}
            </div>
            <div className="text-xs text-[#9f928a]">Petals from achievements</div>
          </div>
        </div>
      </div>

      {/* Cosmetics Summary */}
      {summary.cosmetics && (
        <div className="mt-6 border-t border-[#896f48]/20 pt-5">
          <div className="mb-2 text-sm text-[#d9cdbd]">Cosmetics</div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xl text-[#fff1e4]">{summary.cosmetics.totalOwned}</div>
              <div className="text-xs text-[#9f928a]">Total Owned</div>
            </div>
            <div>
              <div className="text-xl text-[#fff1e4]">{summary.cosmetics.hudSkins}</div>
              <div className="text-xs text-[#9f928a]">HUD Skins</div>
            </div>
            <div>
              <div className="text-xl text-[#fff1e4]">{summary.cosmetics.avatarCosmetics}</div>
              <div className="text-xs text-[#9f928a]">Avatar Items</div>
            </div>
          </div>
        </div>
      )}

      {/* Active Vouchers */}
      {summary.vouchers && summary.vouchers.activeCount > 0 && (
        <div className="mt-6 border-t border-[#618c72]/35 pt-5">
          <div className="mb-2 text-sm text-[#b9d3c1]">Active discount vouchers</div>
          <div className="text-2xl text-[#fff1e4]">{summary.vouchers.activeCount}</div>
          <div className="mt-1 text-xs text-[#9f928a]">Available for checkout</div>
        </div>
      )}
    </section>
  );
}
