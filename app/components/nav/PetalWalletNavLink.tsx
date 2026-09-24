'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import PetalWalletBadge from './PetalWalletBadge';

const PETAL_WALLET_HREF = '/profile/petals';

type PetalWalletNavLinkProps = {
  isLoaded: boolean;
  isSignedIn: boolean;
  signInHref: string;
  onNavigate?: () => void;
  variant?: 'desktop' | 'mobile';
};

type BalanceState =
  | { status: 'idle'; balance: null }
  | { status: 'loading'; balance: null }
  | { status: 'ready'; balance: number }
  | { status: 'error'; balance: null };

export default function PetalWalletNavLink({
  isLoaded,
  isSignedIn,
  signInHref,
  onNavigate,
  variant = 'desktop',
}: PetalWalletNavLinkProps) {
  const [balanceState, setBalanceState] = useState<BalanceState>({ status: 'idle', balance: null });
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setBalanceState({ status: 'idle', balance: null });
      return undefined;
    }

    const controller = new AbortController();
    setBalanceState({ status: 'loading', balance: null });

    fetch('/api/v1/petals/wallet', {
      credentials: 'same-origin',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Petal wallet unavailable');
        const payload = await response.json();
        const balance = payload?.data?.balance;
        if (!payload?.ok || typeof balance !== 'number') {
          throw new Error('Petal wallet unavailable');
        }
        setBalanceState({ status: 'ready', balance });
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setBalanceState({ status: 'error', balance: null });
      });

    return () => controller.abort();
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    const handlePulse = () => {
      setIsPulsing(true);
      window.setTimeout(() => setIsPulsing(false), 520);
    };

    window.addEventListener('otm:petal-collected', handlePulse);
    return () => window.removeEventListener('otm:petal-collected', handlePulse);
  }, []);

  const label = useMemo(() => {
    if (!isLoaded) return 'Loading Petal Wallet';
    if (!isSignedIn) return 'Sign in to view Petals';
    if (balanceState.status === 'ready') {
      return `View Petals, ${balanceState.balance} available`;
    }
    if (balanceState.status === 'error') return 'View Petals, balance unavailable';
    return 'View Petals, balance loading';
  }, [balanceState, isLoaded, isSignedIn]);

  const showBalance = isSignedIn && balanceState.status === 'ready';
  const isMobile = variant === 'mobile';
  const href = isSignedIn ? PETAL_WALLET_HREF : signInHref;

  return (
    <Link
      href={href}
      prefetch={false}
      onClick={onNavigate}
      aria-label={label}
      className={`group inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[#f6c8d6]/22 bg-[#10080d]/18 text-[#ffe7ee] transition hover:border-[#f0b7c8]/50 hover:bg-[#f0b7c8]/12 focus:outline-none focus:ring-2 focus:ring-[#f3b3c8]/35 ${
        isMobile ? 'w-full px-4 py-3' : 'min-w-[52px] px-3 py-2'
      }`}
      data-testid="petal-wallet-nav"
      data-state={isSignedIn ? balanceState.status : 'signed-out'}
    >
      <PetalWalletBadge
        balance={showBalance ? balanceState.balance : null}
        isLoading={isSignedIn && balanceState.status === 'loading'}
        pulsing={isPulsing}
        showLabel={isMobile}
        state={isSignedIn ? balanceState.status : 'signed-out'}
        variant={variant}
      />
    </Link>
  );
}
