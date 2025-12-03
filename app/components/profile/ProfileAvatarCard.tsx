'use client';

import { logger } from '@/app/lib/logger';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { AvatarDisplay } from './AvatarDisplay';

/**
 * Avatar card for profile left column
 * Uses avatar-engine if available, shows placeholder if not
 */
export default function ProfileAvatarCard() {
  const { user, isSignedIn } = useUser();
  const [copied, setCopied] = useState(false);

  // Check if user has an avatar
  const { data: avatarData, isLoading: avatarLoading } = useQuery({
    queryKey: ['user-avatar', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/v1/avatar/load');
      if (!response.ok) return null;
      const result = await response.json();
      return result.data;
    },
    enabled: !!isSignedIn && !!user?.id,
  });

  const hasAvatar = Boolean(avatarData?.avatarConfig);

  const handleCopyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error('Failed to copy profile link:', undefined, undefined, err instanceof Error ? err : new Error(String(err)));
    }
  };

  if (!isSignedIn) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Avatar</h3>
        <div className="aspect-square rounded-lg border-2 border-dashed border-white/20 bg-black/30 flex items-center justify-center mb-4">
          <div className="text-center">
            <div className="text-4xl mb-2">
              <span role="img" aria-label="User icon">
                <span role="img" aria-label="emoji">�</span><span role="img" aria-label="emoji">�</span>
              </span>
            </div>
            <p className="text-sm text-zinc-400">No avatar yet</p>
          </div>
        </div>
        <p className="text-xs text-zinc-500 text-center mb-4">
          Sign in to save your avatar and profile.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Avatar</h3>

      {/* Avatar Display */}
      {avatarLoading ? (
        <div className="aspect-square rounded-lg border border-white/20 bg-black/30 flex items-center justify-center mb-4">
          <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : hasAvatar ? (
        <div className="mb-4">
          <AvatarDisplay size="lg" showEditButton={false} />
          <p className="text-xs text-zinc-400 text-center mt-2">This is your Otaku-mori avatar</p>
        </div>
      ) : (
        <div className="aspect-square rounded-lg border-2 border-dashed border-white/20 bg-black/30 flex items-center justify-center mb-4">
          <div className="text-center">
            <div className="text-4xl mb-2">
              <span role="img" aria-label="Cherry blossom">
                <span role="img" aria-label="emoji">�</span><span role="img" aria-label="emoji">�</span>
              </span>
            </div>
            <p className="text-sm text-zinc-400">No avatar yet</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        <Link
          href="/community"
          className="block w-full px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 rounded-lg text-center text-sm text-white transition-colors"
        >
          {hasAvatar ? 'Customize Avatar' : 'Create Avatar'}
        </Link>

        <button
          onClick={handleCopyProfileLink}
          className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors"
        >
          {copied ? '✓ Copied!' : 'Copy Profile Link'}
        </button>
      </div>
    </div>
  );
}
