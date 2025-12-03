'use client';

import { logger } from '@/app/lib/logger';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';

const CharacterEditor = dynamic(
  () => import('@/app/components/avatar/CharacterEditor'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-white/80">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p>Loading avatar editor…</p>
        </div>
      </div>
    ),
  },
);
import {
  saveGuestCharacter,
  getAllGuestCharacters,
  getMostRecentGuestCharacter,
  type GuestCharacter,
} from '@/app/lib/avatar/guest-storage';
import { avatarPartManager } from '@/app/lib/3d/avatar-parts';

);
}
export default function CharacterEditorPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isGuest, setIsGuest] = useState(false);
  const [guestCharacters, setGuestCharacters] = useState<GuestCharacter[]>([]);
  const [selectedGuestCharacter, setSelectedGuestCharacter] = useState<GuestCharacter | null>(null);

  useEffect(() => {
    if (isLoaded) {
      setIsGuest(!user);
      if (!user) {
        // Load guest characters
        const characters = getAllGuestCharacters();
        setGuestCharacters(characters);
        const recent = getMostRecentGuestCharacter();
        setSelectedGuestCharacter(recent);
      }
    }
  }, [user, isLoaded]);

  const handleConfigurationChange = (_config: AvatarConfiguration) => {
    // Configuration changes are handled by the editor component
  };

  const handleSave = (config: AvatarConfiguration) => {
    if (isGuest) {
      // Save as guest character
      const name = prompt('Enter a name for your character:', 'My Character') || 'My Character';
      try {
        const guestChar = saveGuestCharacter(config, name);
        setGuestCharacters(getAllGuestCharacters());
        setSelectedGuestCharacter(guestChar);
        alert(`Character "${name}" saved! It will be available for 7 days.`);
      } catch (error) {
        logger.error('Failed to save guest character:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
        alert('Failed to save character. Please try again.');
      }
    } else {
      // For authenticated users, save to database
      logger.warn('Saving configuration to database:', config);
      // TODO: Implement database save for authenticated users
      alert('Character saved! (Database save coming soon)');
    }
  };

  const handleLoadGuestCharacter = (character: GuestCharacter) => {
    setSelectedGuestCharacter(character);
    // The CharacterEditor will receive this via initialConfiguration
  };

  const handleUseInGame = (config: AvatarConfiguration) => {
    if (isGuest) {
      // Save guest character first if not already saved
      const name = prompt('Enter a name for your character:', 'My Character') || 'My Character';
      try {
        saveGuestCharacter(config, name);
      } catch (error) {
        logger.error('Failed to save guest character:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      }
    }
    // Navigate to mini-games page
    router.push('/mini-games');
  };

  // Get initial configuration
  const getInitialConfiguration = (): AvatarConfiguration => {
    if (selectedGuestCharacter) {
      return selectedGuestCharacter.config;
    }
    // Create default configuration
    return avatarPartManager.createConfiguration('guest-user', 'female');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black">
      {/* Guest Mode Indicator */}
      {isGuest && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-pink-500/20 backdrop-blur-lg border border-pink-500/30 rounded-lg px-4 py-2 text-pink-200 text-sm">
          <span className="font-semibold">Guest Mode:</span> Your characters will be saved
          temporarily for 7 days.{' '}
          <button
            onClick={() => router.push('/sign-in?redirect_url=/character-editor')}
            className="underline hover:text-pink-100"
          >
            Sign in to save permanently
          </button>
        </div>
      )}

      {/* Guest Character List */}
      {isGuest && guestCharacters.length > 0 && (
        <div className="fixed top-16 left-4 z-40 bg-black/50 backdrop-blur-lg border border-white/20 rounded-lg p-4 max-w-xs">
          <h3 className="text-white font-semibold mb-2 text-sm">Your Characters</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {guestCharacters.map((char) => (
              <button
                key={char.id}
                onClick={() => handleLoadGuestCharacter(char)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedGuestCharacter?.id === char.id
                    ? 'bg-pink-500/30 text-pink-100 border border-pink-500/50'
                    : 'bg-white/5 text-white/80 hover:bg-white/10'
                }`}
              >
                <div className="font-medium">{char.name}</div>
                <div className="text-xs text-white/60">
                  {new Date(char.createdAt).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <CharacterEditor
        initialConfiguration={getInitialConfiguration()}
        onConfigurationChange={handleConfigurationChange}
        onSave={handleSave}
        onUseInGame={handleUseInGame}
        isGuest={isGuest}
        className="h-screen"
      />
    </div>
  );
}
