'use client';

import { logger } from '@/app/lib/logger';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import CommentsSection from '../../components/CommentsSection';
import { type ProfileView, type ProfileSection } from '@/app/lib/contracts';

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
      logger.error('Profile load error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    if (username) {
      loadProfile();
    }
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
      logger.error('Follow error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'idle':
        return 'bg-yellow-500';
      case 'dnd':
        return 'bg-red-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
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
      <main className="min-h-screen bg-gradient-to-br from-pink-50 via-gray-50 to-pink-100">
        <div className="container mx-auto max-w-4xl p-4">
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-pink-400 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-pink-300/70 mt-2">Loading profile...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-pink-50 via-gray-50 to-pink-100">
        <div className="container mx-auto max-w-4xl p-4">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-pink-300 mb-4">Profile Not Found</h1>
            <p className="text-pink-300/70 mb-6">This profile doesn't exist or is private.</p>
            <GlassButton href="/" variant="secondary">
              Back to Home
            </GlassButton>
          </div>
        </div>
      </main>
    );
  }

  const isOwnProfile = currentUser?.username === username;

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-gray-50 to-pink-100">
      <div className="container mx-auto max-w-4xl p-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <GlassCard className="p-8">
            {/* Banner */}
            {profile.bannerUrl && (
              <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
                {}
                <img
                  src={profile.bannerUrl}
                  alt="Profile banner"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Profile Info */}
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 bg-pink-600 rounded-full flex items-center justify-center text-pink-100 text-2xl font-bold">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt="Profile avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    profile.display_name?.charAt(0) || profile.username.charAt(0)
                  )}
                </div>
                {profile.presence && (
                  <div
                    className={`absolute -bottom-1 -right-1 w-6 h-6 ${getStatusColor(profile.presence.status)} rounded-full border-2 border-pink-100`}
                  ></div>
                )}
              </div>

              {/* Profile Details */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-3xl font-bold text-pink-300">
                    {profile.display_name || profile.username}
                  </h1>
                  {profile.presence && (
                    <span className="text-sm text-pink-200/70">
                      {getStatusText(profile.presence.status)}
                    </span>
                  )}
                </div>

                <p className="text-pink-200/70 mb-2">@{profile.username}</p>

                {profile.bio && <p className="text-pink-100/90 mb-4">{profile.bio}</p>}

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-pink-200/70 mb-4">
                  <span>{followerCount} followers</span>
                  <span>{profile.followingCount} following</span>
                  {profile.location && <span>{profile.location}</span>}
                </div>

                {/* Links */}
                {profile.links.length > 0 && (
                  <div className="flex items-center gap-4 mb-4">
                    {profile.links.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-300 hover:text-pink-200 transition-colors"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  {!isOwnProfile && (
                    <GlassButton
                      onClick={handleFollow}
                      variant={isFollowing ? 'secondary' : 'primary'}
                      className="px-6 py-2"
                    >
                      {isFollowing ? 'Unfollow' : 'Follow'}
                    </GlassButton>
                  )}

                  {isOwnProfile && (
                    <GlassButton href="/profile/edit" variant="secondary" className="px-6 py-2">
                      Edit Profile
                    </GlassButton>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Profile Sections */}
        <div className="space-y-6">
          {profile.sections
            .filter((section) => section.visible)
            .sort((a, b) => a.orderIdx - b.orderIdx)
            .map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
              >
                <ProfileSectionComponent section={section} profile={profile} />
              </motion.div>
            ))}
        </div>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8"
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
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-pink-300 mb-4">About</h2>
          {profile.bio ? (
            <p className="text-pink-100/90 leading-relaxed">{profile.bio}</p>
          ) : (
            <p className="text-pink-300/50 italic">No bio yet</p>
          )}
        </GlassCard>
      );

    case 'stats':
      return (
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-pink-300 mb-4">Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-300">{profile.followerCount}</div>
              <div className="text-sm text-pink-200/70">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-300">{profile.followingCount}</div>
              <div className="text-sm text-pink-200/70">Following</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-300">0</div>
              <div className="text-sm text-pink-200/70">Games Played</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-300">0</div>
              <div className="text-sm text-pink-200/70">Achievements</div>
            </div>
          </div>
        </GlassCard>
      );

    case 'achievements':
      return (
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-pink-300 mb-4">Achievements</h2>
          <div className="text-center py-8">
            <p className="text-pink-300/50 italic">No achievements yet</p>
          </div>
        </GlassCard>
      );

    case 'collections':
      return (
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-pink-300 mb-4">Collections</h2>
          <div className="text-center py-8">
            <p className="text-pink-300/50 italic">No collections yet</p>
          </div>
        </GlassCard>
      );

    default:
      return null;
  }
}

