import React from 'react';
import { cn } from '@/lib/utils';
import TierFrame from './TierFrame';
import AchievementBadge from './AchievementBadge';

export type FramedBadgeProps = {
  tier?: number; // optional; if absent, render badge without frame
  badgeKey: string; // e.g., "shop:first_purchase"
  label: string;
  size?: number;
  className?: string;
  animate?: boolean;
  ariaLabel?: string; // a11y label for the combined framed badge
};

export default function FramedBadge({
  tier,
  badgeKey,
  label,
  size = 96,
  className,
  animate = true,
  ariaLabel,
}: FramedBadgeProps) {
  const badgeSize = Math.floor(size * 0.7); // Badge is 70% of frame size

  const badge = <AchievementBadge keyId={badgeKey} label={label} className="w-full h-full" />;

  if (tier && tier >= 1 && tier <= 10) {
    const frameProps: any = {
      tier: tier as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
      size,
      animate,
      ariaLabel: ariaLabel || `${label} - Tier ${tier}`,
    };
    if (className !== undefined) frameProps.className = className;
    return (
      <TierFrame {...frameProps}>
        <div style={{ width: badgeSize, height: badgeSize }}>{badge}</div>
      </TierFrame>
    );
  }

  // No tier provided, render badge alone
  return (
    <div
      className={cn('inline-block', className)}
      style={{ width: size, height: size }}
      aria-label={ariaLabel || label}
    >
      <div style={{ width: badgeSize, height: badgeSize }}>{badge}</div>
    </div>
  );
}
