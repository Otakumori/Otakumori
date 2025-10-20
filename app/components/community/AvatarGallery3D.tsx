'use client';

import React, { useState } from 'react';
import { Profile3DThumbnail, Profile3DFullscreen } from '../profile/Profile3DViewer';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';

interface AvatarGallery3DProps {
  avatars: Array<{
    id: string;
    userId: string;
    name: string;
    configuration?: AvatarConfiguration;
    thumbnailUrl?: string;
  }>;
  title?: string;
  className?: string;
  maxColumns?: number;
  showNames?: boolean;
}

export default function AvatarGallery3D({
  avatars,
  title = 'Community Avatars',
  className = '',
  maxColumns = 4,
  showNames = true,
}: AvatarGallery3DProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [fullscreenAvatar, setFullscreenAvatar] = useState<(typeof avatars)[0] | null>(null);

  const handleAvatarClick = (avatar: (typeof avatars)[0]) => {
    setSelectedAvatar(avatar.id);
    setFullscreenAvatar(avatar);
  };

  const selectedAvatarData = avatars.find((avatar) => avatar.id === selectedAvatar);

  const handleCloseFullscreen = () => {
    setFullscreenAvatar(null);
    setSelectedAvatar(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Title */}
      {title && <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>}

      {/* Avatar Grid */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${maxColumns}, minmax(120px, 1fr))` }}
      >
        {avatars.map((avatar) => (
          <div
            key={avatar.id}
            className={`group cursor-pointer transition-all duration-200 ${
              selectedAvatar === avatar.id ? 'ring-2 ring-pink-500 ring-opacity-50' : ''
            }`}
            onClick={() => handleAvatarClick(avatar)}
          >
            {/* 3D Avatar Thumbnail */}
            <div className="relative">
              <Profile3DThumbnail
                userId={avatar.userId}
                configuration={avatar.configuration}
                className="transition-transform duration-200 group-hover:scale-105"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium transition-opacity duration-200">
                  View
                </span>
              </div>
            </div>

            {/* Avatar Name */}
            {showNames && (
              <div className="mt-2 text-center">
                <p className="text-sm text-gray-300 truncate" title={avatar.name}>
                  {avatar.name}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Avatar Details */}
      {selectedAvatarData && (
        <div className="mt-6 p-4 bg-white/10 rounded-lg border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-2">Selected Avatar</h3>
          <div className="flex items-center space-x-4">
            <Profile3DThumbnail
              userId={selectedAvatarData.userId}
              configuration={selectedAvatarData.configuration}
              className="w-16 h-20"
            />
            <div>
              <p className="text-white font-medium">{selectedAvatarData.name}</p>
              <p className="text-gray-300 text-sm">Click to view in fullscreen</p>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Viewer */}
      {fullscreenAvatar && (
        <Profile3DFullscreen
          userId={fullscreenAvatar.userId}
          configuration={fullscreenAvatar.configuration}
          onClose={handleCloseFullscreen}
        />
      )}
    </div>
  );
}

// Compact version for sidebars
export function AvatarList3D({
  avatars,
  className = '',
}: {
  avatars: Array<{
    id: string;
    userId: string;
    name: string;
    configuration?: AvatarConfiguration;
  }>;
  className?: string;
}) {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  return (
    <div className={`space-y-3 ${className}`}>
      {avatars.map((avatar) => (
        <div
          key={avatar.id}
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          onClick={() => setSelectedAvatar(avatar.id)}
        >
          {/* Small 3D Avatar */}
          <div className="flex-shrink-0">
            <Profile3DThumbnail
              userId={avatar.userId}
              configuration={avatar.configuration}
              className="w-12 h-16"
            />
          </div>

          {/* Avatar Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{avatar.name}</p>
            <p className="text-xs text-gray-400">Click to view</p>
          </div>
        </div>
      ))}

      {/* Fullscreen for selected avatar */}
      {selectedAvatar && (
        <Profile3DFullscreen
          userId={avatars.find((a) => a.id === selectedAvatar)?.userId}
          configuration={avatars.find((a) => a.id === selectedAvatar)?.configuration}
          onClose={() => setSelectedAvatar(null)}
        />
      )}
    </div>
  );
}
