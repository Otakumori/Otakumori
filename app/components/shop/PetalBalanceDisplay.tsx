'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

import { MoriUnavailableState } from '@/app/components/mori';

/**
 * PetalWallet-backed balances are deliberately not queried until the missing
 * Production relation is resolved. This keeps cart commerce dependable while
 * preserving the future reward surface.
 */
export function PetalBalanceDisplay() {
  const { isSignedIn } = useUser();

  if (!isSignedIn) {
    return (
      <MoriUnavailableState
        title="Petal Pouch coming later"
        description="Sign-in still works, but petal rewards are not shown in cart until the wallet backend is verified."
        action={
          <Link href="/sign-in" className="text-sm text-[var(--mori-sakura-light)] underline underline-offset-4">
            Sign in to your account
          </Link>
        }
        className="mb-6"
      />
    );
  }

  return (
    <MoriUnavailableState
      title="Petal Pouch is temporarily unavailable"
      description="Your cart, variants, totals, and checkout remain available. Petal balances and rewards will return after the wallet relation is restored."
      className="mb-6"
    />
  );
}
