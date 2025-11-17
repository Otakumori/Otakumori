'use client';

import { useUser } from '@clerk/nextjs';
import { usePetalBalance } from '@/app/hooks/usePetalBalance';

interface ProfileHeaderProps {
  displayName?: string;
  tagline?: string;
}

/**
 * Steam-style profile header banner
 * Shows display name, tagline, and petal stats on the right
 */
export default function ProfileHeader({ displayName, tagline }: ProfileHeaderProps) {
  const { user, isSignedIn } = useUser();
  const { balance, lifetimeEarned, isGuest } = usePetalBalance();

  const userName = displayName || user?.fullName || user?.username || 'Wanderer';
  const userTagline = tagline || 'Embrace the shadows, master the art.';

  return (
    <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-purple-900/50 via-pink-900/30 to-black/80 p-6 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl" />
      </div>

      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: User Info */}
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{userName}</h1>
          <p className="text-sm md:text-base text-zinc-300 italic">{userTagline}</p>
        </div>

        {/* Right: Petal Stats */}
        {isSignedIn && !isGuest ? (
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Current Balance */}
            <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 backdrop-blur-sm p-4 min-w-[140px]">
              <div className="text-xs text-pink-200/70 mb-1">Petals</div>
              <div className="text-2xl font-bold text-white">{balance.toLocaleString()}</div>
              <div className="text-[10px] text-pink-200/50 mt-1">Current balance</div>
            </div>

            {/* Lifetime Petals */}
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm p-4 min-w-[140px]">
              <div className="text-xs text-purple-200/70 mb-1">Lifetime Petals</div>
              <div className="text-2xl font-bold text-white">{lifetimeEarned.toLocaleString()}</div>
              <div className="text-[10px] text-purple-200/50 mt-1">Total earned</div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
            <div className="text-xs text-zinc-400 mb-1">Sign in to track petals</div>
            <div className="text-sm text-zinc-300">Your progress will be saved</div>
          </div>
        )}
      </div>
    </div>
  );
}
