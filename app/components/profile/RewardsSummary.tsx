'use client';

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
        console.error('Error fetching petal summary:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [isSignedIn]);

  if (!isSignedIn) {
    return (
      <section className="rounded-2xl border border-white/10 bg-black/50 p-5">
        <h2 className="text-xl font-semibold text-white mb-4">Your Petal Rewards</h2>
        <div className="text-center py-8">
          <p className="text-zinc-300 mb-2">Sign in to save your petals and track your lifetime total.</p>
          <p className="text-sm text-zinc-400">Your progress will be saved and you can unlock achievements!</p>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-white/10 bg-black/50 p-5">
        <h2 className="text-xl font-semibold text-white mb-4">Your Petal Rewards</h2>
        <div className="text-center py-8">
          <div className="animate-pulse text-zinc-400">Loading your rewards...</div>
        </div>
      </section>
    );
  }

  if (error || !summary) {
    return (
      <section className="rounded-2xl border border-white/10 bg-black/50 p-5">
        <h2 className="text-xl font-semibold text-white mb-4">Your Petal Rewards</h2>
        <div className="text-center py-8">
          <p className="text-red-400 mb-2">Failed to load rewards</p>
          <p className="text-sm text-zinc-400">{error || 'Please try again later'}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-black/50 p-5">
      <h2 className="text-xl font-semibold text-white mb-4">Your Petal Rewards</h2>
      
      {/* Current Balance & Lifetime */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-4">
          <div className="text-sm text-pink-200/70 mb-1">Current Balance</div>
          <div className="text-3xl font-bold text-white">{summary.balance.toLocaleString()}</div>
          <div className="text-xs text-pink-200/50 mt-1">Available to spend</div>
        </div>
        
        <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
          <div className="text-sm text-purple-200/70 mb-1">Lifetime Earned</div>
          <div className="text-3xl font-bold text-white">{summary.lifetimePetalsEarned.toLocaleString()}</div>
          <div className="text-xs text-purple-200/50 mt-1">Total all-time</div>
        </div>
      </div>

      {/* Today's Progress */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-zinc-300">Today's Earnings</div>
          {summary.dailyCapReached && (
            <span className="text-xs text-yellow-400 bg-yellow-400/20 px-2 py-1 rounded">
              Daily Cap Reached
            </span>
          )}
        </div>
        <div className="text-2xl font-semibold text-white">{summary.todayEarned.toLocaleString()}</div>
        <div className="text-xs text-zinc-400 mt-1">Petals earned today</div>
      </div>

      {/* Achievements Summary */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-6">
        <div className="text-sm text-zinc-300 mb-2">Achievements</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xl font-semibold text-white">{summary.achievements.count}</div>
            <div className="text-xs text-zinc-400">Unlocked</div>
          </div>
          <div>
            <div className="text-xl font-semibold text-white">
              {summary.achievements.petalsEarned.toLocaleString()}
            </div>
            <div className="text-xs text-zinc-400">Petals from achievements</div>
          </div>
        </div>
      </div>

      {/* Cosmetics Summary */}
      {summary.cosmetics && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-6">
          <div className="text-sm text-zinc-300 mb-2">Cosmetics</div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xl font-semibold text-white">{summary.cosmetics.totalOwned}</div>
              <div className="text-xs text-zinc-400">Total Owned</div>
            </div>
            <div>
              <div className="text-xl font-semibold text-white">{summary.cosmetics.hudSkins}</div>
              <div className="text-xs text-zinc-400">HUD Skins</div>
            </div>
            <div>
              <div className="text-xl font-semibold text-white">{summary.cosmetics.avatarCosmetics}</div>
              <div className="text-xs text-zinc-400">Avatar Items</div>
            </div>
          </div>
        </div>
      )}

      {/* Active Vouchers */}
      {summary.vouchers && summary.vouchers.activeCount > 0 && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
          <div className="text-sm text-green-200/70 mb-2">Active Discount Vouchers</div>
          <div className="text-2xl font-semibold text-white">{summary.vouchers.activeCount}</div>
          <div className="text-xs text-green-200/50 mt-1">Available for checkout</div>
        </div>
      )}
    </section>
  );
}

