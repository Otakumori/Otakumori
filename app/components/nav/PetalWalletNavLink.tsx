'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import PetalWalletIcon from '@/app/components/icons/PetalWalletIcon';

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

function formatPetalBalance(balance: number) {
  if (balance > 9999) return '9K+';
  if (balance >= 1000) return `${Math.floor(balance / 1000)}K+`;
  return `${balance}`;
}

export default function PetalWalletNavLink({
  isLoaded,
  isSignedIn,
  signInHref,
  onNavigate,
  variant = 'desktop',
}: PetalWalletNavLinkProps) {
  const [balanceState, setBalanceState] = useState<BalanceState>({ status: 'idle', balance: null });

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
      <PetalWalletIcon
        compact={!showBalance}
        className={`${isMobile ? 'h-6 w-6' : 'h-5 w-5'} text-[#f6b7c6] transition group-hover:text-[#ffd6df]`}
      />
      {isMobile && <span className="text-sm font-medium">Petals</span>}
      {isSignedIn && balanceState.status === 'loading' && (
        <span
          className="h-3 w-7 rounded-full bg-[#ffe7ee]/18"
          aria-hidden="true"
          data-testid="petal-wallet-loading"
        />
      )}
      {showBalance && (
        <span className="min-w-[2ch] text-sm font-semibold tabular-nums text-[#fff4e8]">
          {formatPetalBalance(balanceState.balance)}
        </span>
      )}
    </Link>
  );
}
