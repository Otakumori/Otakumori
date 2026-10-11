'use client';

import { logger } from '@/app/lib/logger';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { AvatarDisplay } from './AvatarDisplay';
import { MoriArtifact, MoriConstructedSurface } from '@/app/components/mori/MoriProduction';

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
      logger.error(
        'Failed to copy profile link:',
        undefined,
        undefined,
        err instanceof Error ? err : new Error(String(err)),
      );
    }
  };

  if (!isSignedIn) {
    return (
      <MoriArtifact as="section" family="commander" className="commander-material-region">
        <h2 className="font-display text-xl text-[#fff1e4]">Avatar</h2>
        <p className="mt-3 text-sm leading-6 text-[#cdbbb7]">
          Sign in to save your avatar and profile.
        </p>
      </MoriArtifact>
    );
  }

  return (
    <MoriArtifact as="section" family="commander" className="commander-material-region">
      <h2 className="font-display text-xl text-[#fff1e4]">Avatar</h2>

      {avatarLoading ? (
        <div aria-busy="true" className="commander-artifact-frame mt-4 aspect-square" role="status">
          <span className="text-sm text-[#cdbbb7]">Preparing avatar…</span>
        </div>
      ) : hasAvatar ? (
        <MoriConstructedSurface
          construction="retained-glass"
          className="commander-artifact-frame mt-4"
        >
          <AvatarDisplay size="lg" showEditButton={false} />
          <p className="mt-2 text-center text-xs text-[#9f928a]">Your Otaku-mori avatar</p>
        </MoriConstructedSurface>
      ) : (
        <MoriConstructedSurface
          construction="retained-glass"
          className="commander-artifact-frame mt-4 grid aspect-square place-items-center text-center"
        >
          <div>
            <p className="font-display text-xl text-[#fff1e4]">No avatar yet</p>
            <p className="mt-2 text-sm text-[#cdbbb7]">Your identity frame is waiting.</p>
          </div>
        </MoriConstructedSurface>
      )}

      <div className="commander-profile__actions">
        <Link href="/community" className="mori-foundation-button text-center">
          {hasAvatar ? 'Customize Avatar' : 'Create Avatar'}
        </Link>

        <button
          type="button"
          onClick={handleCopyProfileLink}
          className="mori-foundation-button"
          data-mori-variant="secondary"
        >
          {copied ? 'Copied' : 'Copy Profile Link'}
        </button>
      </div>
    </MoriArtifact>
  );
}
