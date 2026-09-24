'use client';

import { logger } from '@/app/lib/logger';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import GlassButton from '../../components/ui/GlassButton';
import CommentsSection from '../../components/CommentsSection';
import { type ProfileView, type ProfileSection } from '@/app/lib/contracts';
import { approvedVisualAssets } from '@/lib/approved-visual-assets';
import { MoriArtwork } from '@/app/components/approved-art/MoriArtwork';

export default function ProfilePageClient() {
  const { username } = useParams();
  const { user: currentUser } = useUser();
  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/v1/profile/${username}`);
      const result = await response.json();

      if (result.ok) {
        setProfile(result.data);
        setIsFollowing(result.data.isFollowing);
        setFollowerCount(result.data.followerCount);
      } else {
        logger.error('Failed to load profile:', result.error);
      }
    } catch (error) {
      logger.error(
        'Profile load error:',
        undefined,
        undefined,
        error instanceof Error ? error : new Error(String(error)),
      );
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    if (username) void loadProfile();
  }, [username, loadProfile]);

  const handleFollow = async () => {
    if (!profile) return;

    try {
      const response = await fetch('/api/v1/social/follow', {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId: profile.id }),
      });
      const result = await response.json();

      if (result.ok) {
        setIsFollowing(result.data.isFollowing);
        setFollowerCount(result.data.followerCount);
      } else {
        logger.error('Follow action failed:', result.error);
      }
    } catch (error) {
      logger.error(
        'Follow error:',
        undefined,
        undefined,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-[#8ca47f]';
      case 'idle':
        return 'bg-[#b79a68]';
      case 'dnd':
        return 'bg-[#a85f5a]';
      default:
        return 'bg-[#655c59]';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'idle':
        return 'Away';
      case 'dnd':
        return 'Do Not Disturb';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <main className="mori-page pt-24">
        <div className="mori-shell flex min-h-[60svh] items-center justify-center py-10">
          <div className="text-center">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border border-[#efc7d2]/20 border-t-[#efc7d2]/70" />
            <p className="mt-4 text-sm text-[#8f7f7d]">Loading profile…</p>
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="mori-page pt-24">
        <div className="mori-shell py-16">
          <div className="mori-panel mx-auto max-w-xl p-8 text-center">
            <h1 className="font-display text-2xl font-semibold text-[#fff1e4]">
              Profile not found
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#cdbbb7]">
              This profile does not exist or is private.
            </p>
            <GlassButton href="/" variant="secondary" className="mt-6">
              Back to Home
            </GlassButton>
          </div>
        </div>
      </main>
    );
  }

  const isOwnProfile = currentUser?.username === username;

  return (
    <main className="mori-page pt-24">
      <div className="mori-shell py-8 sm:py-12">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mori-panel overflow-hidden"
        >
          {profile.bannerUrl && (
            <div className="relative h-44 overflow-hidden border-b border-white/[0.08] sm:h-56">
              <img src={profile.bannerUrl} alt="" className="h-full w-full object-cover" />
              <div
                className="absolute inset-0 bg-gradient-to-t from-[#09070a]/75 via-transparent to-transparent"
                aria-hidden="true"
              />
            </div>
          )}

          <div className="p-5 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="relative shrink-0">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/[0.12] bg-[#251a20] font-display text-2xl font-semibold text-[#fff1e4] shadow-[0_14px_30px_rgba(0,0,0,0.32)]">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    profile.display_name?.charAt(0) || profile.username.charAt(0)
                  )}
                </div>
                {profile.presence && (
                  <span
                    className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-[#09070a] ${getStatusColor(profile.presence.status)}`}
                    aria-label={getStatusText(profile.presence.status)}
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h1 className="font-display text-3xl font-semibold text-[#fff1e4]">
                    {profile.display_name || profile.username}
                  </h1>
                  {profile.presence && (
                    <span className="text-xs text-[#8f7f7d]">
                      {getStatusText(profile.presence.status)}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-[#a9855f]">@{profile.username}</p>

                {profile.bio && (
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-[#cdbbb7] sm:text-base">
                    {profile.bio}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#8f7f7d]">
                  <span>
                    <strong className="font-semibold text-[#d9ccc7]">{followerCount}</strong>{' '}
                    followers
                  </span>
                  <span>
                    <strong className="font-semibold text-[#d9ccc7]">
                      {profile.followingCount}
                    </strong>{' '}
                    following
                  </span>
                  {profile.location && <span>{profile.location}</span>}
                </div>

                {profile.links.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {profile.links.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#dca0b3] transition-colors hover:text-[#efc7d2]"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                  {!isOwnProfile && (
                    <GlassButton
                      onClick={handleFollow}
                      variant={isFollowing ? 'secondary' : 'primary'}
                    >
                      {isFollowing ? 'Unfollow' : 'Follow'}
                    </GlassButton>
                  )}
                  {isOwnProfile && (
                    <GlassButton href="/profile/edit" variant="secondary">
                      Edit Profile
                    </GlassButton>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="mt-6 space-y-4">
          {profile.sections
            .filter((section) => section.visible)
            .sort((a, b) => a.orderIdx - b.orderIdx)
            .map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 + index * 0.04 }}
              >
                <ProfileSectionComponent section={section} profile={profile} />
              </motion.div>
            ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="mt-6"
        >
          <CommentsSection contentType="profile" contentId={profile.id} />
        </motion.div>
      </div>
    </main>
  );
}

interface ProfileSectionComponentProps {
  section: ProfileSection;
  profile: ProfileView;
}

function ProfileSectionComponent({ section, profile }: ProfileSectionComponentProps) {
  switch (section.code) {
    case 'about':
      return (
        <section className="mori-panel p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold text-[#fff1e4]">About</h2>
          {profile.bio ? (
            <p className="mt-4 leading-7 text-[#cdbbb7]">{profile.bio}</p>
          ) : (
            <p className="mt-4 text-sm italic text-[#8f7f7d]">No bio yet.</p>
          )}
        </section>
      );

    case 'stats':
      return (
        <section className="mori-panel p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold text-[#fff1e4]">Stats</h2>
          <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['Followers', profile.followerCount],
              ['Following', profile.followingCount],
              ['Games Played', 0],
              ['Achievements', 0],
            ].map(([label, value]) => (
              <div key={label} className="mori-panel-soft p-4">
                <dd className="font-display text-2xl font-semibold text-[#c7a97f]">{value}</dd>
                <dt className="mt-1 text-xs text-[#8f7f7d]">{label}</dt>
              </div>
            ))}
          </dl>
        </section>
      );

    case 'achievements':
      return (
        <section className="mori-panel p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold text-[#fff1e4]">Achievements</h2>
          <p className="mt-6 text-sm italic text-[#8f7f7d]">No public achievements yet.</p>
        </section>
      );

    case 'collections':
      return (
        <section className="mori-panel p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold text-[#fff1e4]">Collections</h2>
          <MoriArtwork
            src={approvedVisualAssets.emptyStates.collection}
            className="mx-auto mt-4 w-40"
            sizes="10rem"
          />
          <p className="mt-4 text-center text-sm italic text-[#8f7f7d]">
            No public collections yet.
          </p>
        </section>
      );

    default:
      return null;
  }
}
