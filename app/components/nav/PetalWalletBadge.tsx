import type { ReactNode } from 'react';
import PetalWalletIcon from '@/app/components/icons/PetalWalletIcon';

type PetalWalletBadgeProps = {
  balance?: number | null;
  icon?: ReactNode;
  isLoading?: boolean;
  showLabel?: boolean;
  variant?: 'desktop' | 'mobile' | 'footer';
  state?: 'loading' | 'ready' | 'error' | 'signed-out' | 'idle';
  pulsing?: boolean;
};

function formatPetalBalance(balance: number) {
  if (balance > 9999) return '9K+';
  if (balance >= 1000) return `${Math.floor(balance / 1000)}K+`;
  return `${balance}`;
}

export { formatPetalBalance };

export default function PetalWalletBadge({
  balance = null,
  icon,
  isLoading = false,
  showLabel = false,
  variant = 'desktop',
  state = 'idle',
  pulsing = false,
}: PetalWalletBadgeProps) {
  const isMobile = variant === 'mobile';
  const showBalance = typeof balance === 'number';
  const iconSize = isMobile ? 'lg' : 'md';

  return (
    <span
      className={`inline-flex items-center justify-center gap-2 ${
        pulsing ? 'motion-safe:animate-[petalWalletPulse_520ms_ease-out_1]' : ''
      }`}
      data-petal-wallet-badge
      data-petal-wallet-variant={variant}
      data-petal-wallet-state={state}
      data-petal-pulse={pulsing ? 'true' : 'false'}
    >
      {icon ?? (
        <PetalWalletIcon
          compact={!showBalance}
          size={iconSize}
          className="text-[#f6b7c6] transition group-hover:text-[#ffd6df]"
        />
      )}
      {showLabel && <span className="text-sm font-medium">Petals</span>}
      {isLoading && (
        <span
          className="h-3 w-7 rounded-full bg-[#ffe7ee]/18"
          aria-hidden="true"
          data-testid="petal-wallet-loading"
        />
      )}
      {showBalance && (
        <span className="min-w-[2ch] text-sm font-semibold tabular-nums text-[#fff4e8]">
          {formatPetalBalance(balance)}
        </span>
      )}
    </span>
  );
}
