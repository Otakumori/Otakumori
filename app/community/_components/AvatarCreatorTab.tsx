'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { ErrorBoundary } from '@/app/avatar/community-hub/components/ErrorBoundary';
import { UltraDetailedCharacterCreator } from '@/app/adults/_components/UltraDetailedCharacterCreator.safe';
import { logger } from '@/app/lib/logger';

const GUEST_AVATAR_KEY = 'otm-guest-avatar';

export function AvatarCreatorTab() {
  const { user, isSignedIn } = useUser();
  const [ultraConfig, setUltraConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Load avatar config for UltraDetailedCharacterCreator
  useEffect(() => {
    if (isSignedIn && user?.id) {
      const loadUltraConfig = async () => {
        try {
          setIsLoading(true);
          const response = await fetch('/api/v1/avatar/load');
          const result = await response.json();
          if (result.ok && result.data?.user?.avatarConfig) {
            setUltraConfig(result.data.user.avatarConfig);
          }
        } catch (error) {
          logger.warn('Failed to load ultra config:', undefined, { error: error instanceof Error ? error : new Error(String(error)) });
        } finally {
          setIsLoading(false);
        }
      };
      loadUltraConfig();
    } else {
      setIsLoading(false);
    }
  }, [isSignedIn, user?.id]);

  // Handle save for UltraDetailedCharacterCreator
  const handleUltraSave = useCallback(async (ultraConfig: any) => {
    if (!isSignedIn || !user?.id) {
      // Save to localStorage for guests
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(GUEST_AVATAR_KEY, JSON.stringify(ultraConfig));
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        }
      } catch (error) {
        logger.error('Failed to save guest avatar:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
        setSaveStatus('error');
      }
      return;
    }

    // Save to API for signed-in users
    try {
      setSaveStatus('saving');
      const response = await fetch('/api/v1/avatar/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': `${user.id}-${Date.now()}`,
        },
        body: JSON.stringify(ultraConfig),
      });

      const result = await response.json();
      if (result.ok) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
        logger.error('Failed to save avatar:', result.error);
      }
    } catch (error) {
      setSaveStatus('error');
      logger.error('Failed to save avatar:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    }
  }, [isSignedIn, user?.id]);

  if (isLoading) {
    return (
      <div className="flex h-[600px] items-center justify-center rounded-lg bg-white/5">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
          <p className="text-sm text-gray-400">Loading avatar creator...</p>
        </div>
      </div>
    );
  }

  // Use UltraDetailedCharacterCreator with preset selector (Code Vein quality)
  return (
    <ErrorBoundary>
      <div className="rounded-lg border border-white/20 bg-white/5">
        <UltraDetailedCharacterCreator
          initialConfig={ultraConfig}
          onSave={handleUltraSave}
          onPreview={(config) => {
            // Preview callback
            logger.warn('Preview updated', undefined, { gender: config.gender });
          }}
        />
        {/* Save Status Indicator */}
        {saveStatus === 'saving' && (
          <div className="fixed bottom-4 right-4 bg-blue-500/90 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            Saving avatar configuration...
          </div>
        )}
        {saveStatus === 'saved' && (
          <div className="fixed bottom-4 right-4 bg-green-500/90 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            Avatar saved successfully!
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="fixed bottom-4 right-4 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            Error: Failed to save avatar
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
