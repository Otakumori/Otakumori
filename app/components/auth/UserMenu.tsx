'use client';

import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { clientEnv } from '@/env/client';
import { paths } from '@/lib/paths';

export default function UserMenu() {
  // Call useUser to maintain session persistence and auth state synchronization
  useUser();
  const [redirectParam, setRedirectParam] = useState<string>('');

  useEffect(() => {
    try {
      const href = window.location.pathname + window.location.search;
      setRedirectParam(`redirect_url=${encodeURIComponent(href)}`);
    } catch {}
  }, []);

  const signInUrl = useMemo(() => {
    const base = clientEnv.NEXT_PUBLIC_CLERK_SIGN_IN_URL || paths.signIn();
    return redirectParam ? `${base}${base.includes('?') ? '&' : '?'}${redirectParam}` : base;
  }, [redirectParam]);

  const signUpUrl = useMemo(() => {
    const base = clientEnv.NEXT_PUBLIC_CLERK_SIGN_UP_URL || paths.signUp();
    return redirectParam ? `${base}${base.includes('?') ? '&' : '?'}${redirectParam}` : base;
  }, [redirectParam]);

  return (
    <div className="flex items-center gap-3">
      <SignedOut>
        <a
          href={signInUrl}
          className="rounded-full bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-fuchsia-950/30 ring-1 ring-fuchsia-200/20 transition hover:bg-fuchsia-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-200"
        >
          Sign in
        </a>
        <a
          href={signUpUrl}
          className="rounded-full border border-white/20 bg-black/30 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-200"
        >
          Create account
        </a>
      </SignedOut>

      <SignedIn>
        <Link
          href={paths.profile()}
          className="rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-200"
        >
          Profile
        </Link>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            variables: {
              colorPrimary: '#db2777',
              colorBackground: '#111017',
              colorText: '#fdf2f8',
              colorTextSecondary: '#e9d5ff',
              colorNeutral: '#27212f',
              colorInputBackground: '#18151f',
              colorInputText: '#fdf2f8',
              borderRadius: '0.875rem',
            },
            elements: {
              avatarBox: 'h-9 w-9 ring-2 ring-fuchsia-200/30 shadow-lg shadow-fuchsia-950/40',
              userButtonPopoverCard: 'border border-white/15 bg-[#111017] text-white shadow-2xl shadow-black/60',
              userButtonPopoverActionButton: 'text-fuchsia-50 hover:bg-fuchsia-500/15',
              userButtonPopoverActionButtonText: 'text-fuchsia-50',
              userButtonPopoverFooter: 'hidden',
            },
          }}
        />
      </SignedIn>
    </div>
  );
}
