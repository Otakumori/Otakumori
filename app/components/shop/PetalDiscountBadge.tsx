'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { PETAL_REWARDS, hasReachedThreshold } from '@/app/lib/petal-economy';

interface PetalDiscountBadgeProps {
  productPrice: number;
}

/**
 * Badge showing if user is eligible for petal discount on a product
 */
export function PetalDiscountBadge({ productPrice }: PetalDiscountBadgeProps) {
  const { isSignedIn } = useUser();
  const [availableDiscount, setAvailableDiscount] = useState<number | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;

    const fetchBalance = async () => {
      try {
        const response = await fetch('/api/v1/petals/wallet');
        if (response.ok) {
          const result = await response.json();
          if (result.ok) {
            const userBalance = result.data.balance;

            // Find highest discount user qualifies for
            const discountRewards = PETAL_REWARDS.filter(
              (r) => r.type === 'discount' && hasReachedThreshold(userBalance, r.threshold),
            );
            if (discountRewards.length > 0) {
              const highestDiscount = Math.max(...discountRewards.map((r) => r.value as number));
              setAvailableDiscount(highestDiscount);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch petal balance:', error);
      }
    };

    fetchBalance();
  }, [isSignedIn]);

  if (!isSignedIn || !availableDiscount) {
    return null;
  }

  const discountAmount = (productPrice * availableDiscount) / 100;
  const discountedPrice = productPrice - discountAmount;

  return (
    <div className="mt-2 p-3 bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-lg border border-pink-500/30 rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg" role="img" aria-label="Discount">
          💰
        </span>
        <span className="text-sm font-semibold text-pink-300">Petal Discount Available!</span>
      </div>
      <p className="text-xs text-white/80 mb-2">
        You qualify for {availableDiscount}% off with your petal balance
      </p>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-bold text-pink-300">${discountedPrice.toFixed(2)}</span>
        <span className="text-sm text-white/60 line-through">${productPrice.toFixed(2)}</span>
        <span className="text-xs text-emerald-300 font-medium">
          Save ${discountAmount.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
