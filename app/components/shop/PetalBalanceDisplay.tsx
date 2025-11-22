'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { getNextReward, getRewardProgress } from '@/app/lib/petal-economy';
import Link from 'next/link';
import { paths } from '@/lib/paths';

/**
 * Display petal balance and next reward progress in shop pages
 */
export function PetalBalanceDisplay() {
  const { isSignedIn } = useUser();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    const fetchBalance = async () => {
      try {
        const response = await fetch('/api/v1/petals/wallet');
        if (response.ok) {
          const result = await response.json();
          if (result.ok) {
            setBalance(result.data.balance);
          }
        }
      } catch (error) {
        console.error('Failed to fetch petal balance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [isSignedIn]);

  if (!isSignedIn) {
    return (
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 mb-6">
        <p className="text-sm text-white/70 mb-2">
          <Link href="/sign-in" className="text-pink-300 hover:text-pink-400 underline">
            Sign in
          </Link>{' '}
          to earn and use petals for discounts!
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 mb-6">
        <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
      </div>
    );
  }

  const nextReward = balance !== null ? getNextReward(balance) : null;
  const progress = balance !== null ? getRewardProgress(balance) : null;

  return (
    <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-lg border border-pink-500/30 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm text-white/70 mb-1">Your Petal Balance</p>
          <p className="text-2xl font-bold text-pink-300">{balance?.toLocaleString() || 0}</p>
        </div>
        <span className="text-3xl" role="img" aria-label="Petals">
          🌸
        </span>
      </div>

      {nextReward && progress && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-white/70">Next Reward: {nextReward.description}</span>
            <span className="text-pink-300 font-medium">{progress.petalsNeeded} needed</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progress.progress * 100}%` }}
            />
          </div>
        </div>
      )}

      <Link
        href={paths.shop()}
        className="mt-4 block text-center text-sm text-pink-300 hover:text-pink-400 underline"
      >
        View available petal discounts →
      </Link>
    </div>
  );
}
