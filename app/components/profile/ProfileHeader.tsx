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
  const userTagline = tagline || 'Your progress, rewards, and identity remain gathered here.';

  return (
    <header className="commander-archive__identity">
      <div className="commander-archive__identity-copy">
        <p className="mori-foundation-eyebrow">Personal record</p>
        <h1>{userName}</h1>
        <p>{userTagline}</p>
      </div>

      {isSignedIn && !isGuest ? (
        <dl className="commander-archive__identity-metrics">
          <div className="commander-archive__identity-metric">
            <dt>Petals</dt>
            <dd>{balance.toLocaleString()}</dd>
          </div>
          <div className="commander-archive__identity-metric">
            <dt>Lifetime</dt>
            <dd>{lifetimeEarned.toLocaleString()}</dd>
          </div>
        </dl>
      ) : (
        <p className="max-w-52 border-l border-[#896f48]/30 pl-4 text-sm leading-6 text-[#cdbbb7]">
          Sign in to keep this record across visits.
        </p>
      )}
    </header>
  );
}
