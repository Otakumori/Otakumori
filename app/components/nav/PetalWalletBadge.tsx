import type { ReactNode } from 'react';
import Image from 'next/image';

const PETAL_WALLET_EMBLEM_SOURCE = '/assets/home/ui/sakura-petal-wallet-emblem.webp';

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
  const showBalance = typeof balance === 'number';
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
        <span
          className="relative grid h-7 w-7 shrink-0 place-items-center"
          data-petal-wallet-source="approved-blossom-emblem-v1"
        >
          <Image
            src={PETAL_WALLET_EMBLEM_SOURCE}
            alt=""
            width={28}
            height={28}
            sizes="28px"
            className="h-7 w-7 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.52)] transition-transform duration-150 group-hover:-translate-y-px group-focus-visible:-translate-y-px motion-reduce:transition-none"
          />
          <span className="sr-only">Petal Wallet</span>
        </span>
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
