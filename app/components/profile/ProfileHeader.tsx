'use client';

import { useUser } from '@clerk/nextjs';
import { usePetalBalance } from '@/app/hooks/usePetalBalance';

interface ProfileHeaderProps {
  displayName?: string;
  tagline?: string;
}

export default function ProfileHeader({ displayName, tagline }: ProfileHeaderProps) {
  const { user, isSignedIn } = useUser();
  const { balance, lifetimeEarned, isGuest } = usePetalBalance();

  const userName = displayName || user?.fullName || user?.username || 'Wanderer';
  const userTagline = tagline || 'Embrace the shadows, master the art.';

  return (
    <section className="mori-panel relative overflow-hidden p-5 sm:p-6">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(169,133,95,0.09),transparent_30%),radial-gradient(circle_at_12%_100%,rgba(117,72,88,0.09),transparent_28%)]"
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[#fff1e4] md:text-4xl">
            {userName}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#cdbbb7] md:text-base">{userTagline}</p>
        </div>

        {isSignedIn && !isGuest ? (
          <dl className="grid w-full grid-cols-2 gap-2 sm:w-auto">
            <div className="mori-panel-soft min-w-[8.5rem] p-4">
              <dt className="text-[10px] uppercase tracking-[0.14em] text-[#8f7f7d]">Petals</dt>
              <dd className="mt-2 font-display text-2xl font-semibold text-[#fff1e4]">{balance.toLocaleString()}</dd>
              <div className="mt-1 text-[10px] text-[#756b67]">Current balance</div>
            </div>
            <div className="mori-panel-soft min-w-[8.5rem] p-4">
              <dt className="text-[10px] uppercase tracking-[0.14em] text-[#8f7f7d]">Lifetime</dt>
              <dd className="mt-2 font-display text-2xl font-semibold text-[#c7a97f]">{lifetimeEarned.toLocaleString()}</dd>
              <div className="mt-1 text-[10px] text-[#756b67]">Petals earned</div>
            </div>
          </dl>
        ) : (
          <div className="mori-panel-soft p-4 text-sm text-[#cdbbb7]">
            <div>Sign in to track petals.</div>
            <div className="mt-1 text-xs text-[#8f7f7d]">Your progress will be saved.</div>
          </div>
        )}
      </div>
    </section>
  );
}
