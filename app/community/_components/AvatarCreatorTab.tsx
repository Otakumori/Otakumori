'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useUser } from '@clerk/nextjs';
import type { CharacterConfig } from '@/app/avatar/community-hub/lib/character-state';
import { createDefaultConfig, cloneConfig } from '@/app/avatar/community-hub/lib/character-state';
import CharacterCanvas from '@/app/avatar/community-hub/components/CharacterCanvas';
import UIControls from '@/app/avatar/community-hub/components/UIControls';
import { ErrorBoundary } from '@/app/avatar/community-hub/components/ErrorBoundary';
import { ExportTools } from './editor/ExportTools';
import type * as THREE from 'three';
import { logger } from '@/app/lib/logger';

// Dynamically import to avoid SSR issues with Three.js
const DynamicCanvas = dynamic(() => Promise.resolve(CharacterCanvas), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-purple-900 via-purple-800 to-black">
      <div className="text-center">
        <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
        <p className="text-sm text-gray-400">Loading 3D Renderer...</p>
      </div>
    </div>
  ),
});

const GUEST_AVATAR_KEY = 'otm-guest-avatar';

export function AvatarCreatorTab() {
  const { user, isSignedIn } = useUser();
  const [config, setConfig] = useState<CharacterConfig>(createDefaultConfig());
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const sceneRef = useRef<THREE.Group | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load avatar config on mount
  useEffect(() => {
    loadAvatarConfig();
  }, [isSignedIn, user?.id]);

  const loadAvatarConfig = useCallback(async () => {
    try {
      setIsLoading(true);

      if (isSignedIn && user?.id) {
        // Load from API for signed-in users
        try {
          const response = await fetch('/api/v1/creator/load');
          const result = await response.json();

          if (result.ok && result.data) {
            // Convert CreatorAvatarConfig to CharacterConfig if needed
            // For now, use default and enhance later
            setConfig(createDefaultConfig());
          } else {
            // No saved avatar, use default
            setConfig(createDefaultConfig());
          }
        } catch (error) {
          logger.warn('Failed to load avatar from API, using default:', undefined, { error: error instanceof Error ? error : new Error(String(error)) });
          setConfig(createDefaultConfig());
        }
      } else {
        // Load from localStorage for guests
        if (typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem(GUEST_AVATAR_KEY);
            if (stored) {
              const parsed = JSON.parse(stored);
              if (parsed && typeof parsed === 'object') {
                setConfig(parsed as CharacterConfig);
              } else {
                setConfig(createDefaultConfig());
              }
            } else {
              setConfig(createDefaultConfig());
            }
          } catch (error) {
            logger.warn('Failed to load guest avatar from localStorage:', undefined, { error: error instanceof Error ? error : new Error(String(error)) });
            setConfig(createDefaultConfig());
          }
        } else {
          setConfig(createDefaultConfig());
        }
      }
    } catch (error) {
      logger.error('Failed to load avatar config:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      setConfig(createDefaultConfig());
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, user?.id]);

  const handleSave = useCallback(async () => {
    if (!isSignedIn || !user?.id) {
      // Save to localStorage for guests
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(GUEST_AVATAR_KEY, JSON.stringify(config));
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

      // Convert CharacterConfig to CreatorAvatarConfig format
      // This is a simplified conversion - enhance later
      const creatorConfig = {
        id: `avatar-${user.id}-${Date.now()}`,
        userId: user.id,
        name: `Avatar ${new Date().toLocaleDateString()}`,
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        baseModel: config.gender === 'male' ? 'male' : 'female',
        body: {
          height: config.physique.height * 0.6 + 0.7,
          weight: config.physique.width * 0.6 + 0.4,
          muscleMass: 0.5,
          bodyFat: 0.5,
          shoulderWidth: config.physique.width * 0.7 + 0.7,
          chestSize: config.gender === 'female' ? config.physique.bust * 0.6 + 0.6 : 1.0,
          waistSize: config.gender === 'female' ? config.physique.waist * 0.6 + 0.6 : 1.0,
          hipWidth: config.gender === 'female' ? config.physique.hips * 0.6 + 0.7 : 1.0,
          armLength: 1.0,
          legLength: 1.0,
          thighSize: 1.0,
          calfSize: 1.0,
          headSize: 1.0,
          neckLength: 1.0,
        },
        face: {
          faceShape: 0.5,
          jawline: 0.5,
          cheekbones: 0.5,
          chinShape: 0.5,
          eyeSize: 1.0,
          eyeSpacing: 1.0,
          eyeHeight: 1.0,
          eyeAngle: 0.0,
          eyelidShape: 0.5,
          eyeColor: config.eyes.colorLeft,
          eyebrowThickness: 1.0,
          eyebrowAngle: 0.0,
          noseSize: 1.0,
          noseWidth: 1.0,
          noseHeight: 1.0,
          bridgeWidth: 1.0,
          nostrilSize: 1.0,
          noseTip: 0.5,
          mouthSize: 1.0,
          mouthWidth: 1.0,
          lipThickness: 1.0,
          lipShape: 0.5,
          cupidBow: 0.5,
          mouthAngle: 0.0,
        },
        skin: {
          tone: config.skinTone,
          texture: 0.5,
          blemishes: 0.0,
          freckles: 0.0,
          ageSpots: 0.0,
          wrinkles: 0.0,
          glossiness: 0.5,
        },
        hair: {
          style: config.hair.style,
          length: 0.5,
          volume: 1.0,
          texture: 0.5,
          color: {
            primary: config.hair.rootColor,
            secondary: config.hair.tipColor,
            gradient: config.hair.rootColor !== config.hair.tipColor,
          },
          highlights: {
            enabled: false,
            color: '#ffffff',
            intensity: 0.0,
            pattern: 'streaks' as const,
          },
        },
        parts: {},
        materials: {
          shader: 'AnimeToon' as const,
          parameters: {
            glossStrength: 0.5,
            rimStrength: 0.3,
            colorA: '#ec4899',
            colorB: '#8b5cf6',
            rimColor: '#ffffff',
            metallic: 0.0,
            roughness: 0.5,
          },
        },
        physics: {
          softBody: {
            enable: false,
            mass: 1.0,
            stiffness: 0.5,
            damping: 0.5,
            maxDisplacement: 0.1,
          },
          clothSim: {
            enable: false,
            bendStiffness: 0.5,
            stretchStiffness: 0.5,
            damping: 0.5,
            wind: 0.0,
          },
        },
      };

      const response = await fetch('/api/v1/creator/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': `${user.id}-${Date.now()}`,
        },
        body: JSON.stringify(creatorConfig),
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
  }, [config, isSignedIn, user?.id]);

  const handleSceneReady = useCallback((scene: THREE.Group) => {
    sceneRef.current = scene;
  }, []);

  const handleConfigChange = useCallback((newConfig: CharacterConfig) => {
    setConfig(newConfig);
    // Auto-save to localStorage for guests
    if (!isSignedIn && typeof window !== 'undefined') {
      try {
        localStorage.setItem(GUEST_AVATAR_KEY, JSON.stringify(newConfig));
      } catch (error) {
        // Silently fail for localStorage saves
      }
    }
  }, [isSignedIn]);

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

  return (
    <ErrorBoundary>
      <div className="flex flex-col overflow-hidden rounded-lg border border-white/20 bg-white/5 lg:flex-row">
        {/* Canvas - Left Side */}
        <div className="relative h-[500px] flex-1 lg:h-[600px]">
          {/* Export Tools Overlay */}
          <div className="absolute top-4 right-4 z-10">
            <ExportTools sceneRef={sceneRef} canvasRef={canvasRef} />
          </div>
          
          <ErrorBoundary
            fallback={
              <div className="flex h-full items-center justify-center bg-black/80 p-8">
                <div className="text-center">
                  <p className="text-white/70">Failed to load 3D renderer</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 rounded-lg bg-pink-500 px-4 py-2 text-sm text-white"
                  >
                    Reload
                  </button>
                </div>
              </div>
            }
          >
            <DynamicCanvas
              config={config}
              showOutline={true}
              onSceneReady={handleSceneReady}
            />
          </ErrorBoundary>
        </div>

        {/* Controls - Right Side */}
        <div className="h-[400px] w-full border-t border-white/10 lg:h-[600px] lg:w-96 lg:border-l lg:border-t-0">
          <ErrorBoundary
            fallback={
              <div className="flex h-full items-center justify-center p-4">
                <p className="text-sm text-white/70">Failed to load controls</p>
              </div>
            }
          >
            <div className="relative h-full">
              <UIControls config={config} onConfigChange={handleConfigChange} sceneRef={sceneRef} />
              
              {/* Save Button - Gated behind sign-in */}
              {isSignedIn && (
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <button
                    onClick={handleSave}
                    disabled={saveStatus === 'saving'}
                    className="w-full rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saveStatus === 'saving' && 'Saving...'}
                    {saveStatus === 'saved' && 'Saved!'}
                    {saveStatus === 'error' && 'Save Failed'}
                    {saveStatus === 'idle' && 'Save Avatar'}
                  </button>
                </div>
              )}
            </div>
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  );
}

