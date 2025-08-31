'use client';

import { useAuth } from '@clerk/nextjs';

export async function rewardPetals(amount: number) {
  try {
    const res = await fetch('/api/petals/collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return { success: false, error: 'auth_required' };
      }
      throw new Error('collect failed');
    }

    return await res.json(); // { total?: number }
  } catch (e) {
    console.warn('Petal reward failed:', e);
    return { success: false, error: 'network_error' };
  }
}

export function useRewards() {
  const { isSignedIn } = useAuth();

  const attemptReward = async (amount: number) => {
    if (!isSignedIn) {
      return { success: false, error: 'auth_required' };
    }

    return await rewardPetals(amount);
  };

  return {
    attemptReward,
    isSignedIn,
  };
}
