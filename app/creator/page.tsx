'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import type { AvatarConfiguration, AvatarPartType } from '@/app/lib/3d/avatar-parts';

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
import type { CreatorAvatarConfig } from '@/app/lib/creator/types';
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card';
import { HeaderButton } from '@/components/ui/header-button';

/**
 * CREATOR Page - Main avatar creation interface
 *
 * Features:
 * - Full-screen immersive creator experience
 * - Real-time 3D preview
 * - Comprehensive slider system
 * - Part selection with search/filter
 * - Save/Load/Export functionality
 * - Preset system
 * - Undo/Redo
 */
export default function CreatorPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load avatar config on mount
  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      // Redirect to sign-in if not authenticated
      router.push('/sign-in?redirect=/creator');
      return;
    }

    loadAvatarConfig();
  }, [user, isLoaded, router]);

  const loadAvatarConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/v1/creator/load');
      const result = await response.json();

      if (result.ok && result.data) {
        // Convert CreatorAvatarConfig to AvatarConfiguration
        const config = convertToAvatarConfiguration(result.data);
        setAvatarConfig(config);
      } else {
        // No avatar config, use default
        setAvatarConfig(null);
      }
    } catch (error) {
      console.error('Failed to load avatar config:', error);
      setAvatarConfig(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!avatarConfig || !user) return;

    try {
      setSaveStatus('saving');

      // Convert AvatarConfiguration to CreatorAvatarConfig
      const creatorConfig = convertToCreatorConfig(avatarConfig, user.id);

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
        setHasUnsavedChanges(false);

        // Reset save status after 2 seconds
        setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
      } else {
        setSaveStatus('error');
        console.error('Failed to save avatar:', result.error);
      }
    } catch (error) {
      setSaveStatus('error');
      console.error('Failed to save avatar:', error);
    }
  }, [avatarConfig, user]);

  const handleConfigurationChange = useCallback((config: AvatarConfiguration) => {
    setAvatarConfig(config);
    setHasUnsavedChanges(true);
    setSaveStatus('idle');
  }, []);

  // Convert CreatorAvatarConfig to AvatarConfiguration
  const convertToAvatarConfiguration = (
    creatorConfig: CreatorAvatarConfig,
  ): AvatarConfiguration => {
    return {
      id: creatorConfig.id,
      userId: creatorConfig.userId,
      baseModel: creatorConfig.baseModel,
      baseModelUrl: creatorConfig.baseModelUrl,
      parts: Object.entries(creatorConfig.parts).reduce(
        (acc, [key, value]) => {
          if (value) {
            // Convert PascalCase to lowercase for AvatarPartType
            const partType = key.toLowerCase() as AvatarPartType;
            acc[partType] = value;
          }
          return acc;
        },
        {} as Partial<Record<AvatarPartType, string>>,
      ),
      morphTargets: {
        // Body morphs
        height: creatorConfig.body.height,
        weight: creatorConfig.body.weight,
        muscleMass: creatorConfig.body.muscleMass,
        bodyFat: creatorConfig.body.bodyFat,
        shoulderWidth: creatorConfig.body.shoulderWidth,
        chestSize: creatorConfig.body.chestSize,
        waistSize: creatorConfig.body.waistSize,
        hipWidth: creatorConfig.body.hipWidth,
        armLength: creatorConfig.body.armLength,
        legLength: creatorConfig.body.legLength,
        thighSize: creatorConfig.body.thighSize,
        calfSize: creatorConfig.body.calfSize,
        headSize: creatorConfig.body.headSize,
        neckLength: creatorConfig.body.neckLength,
        // Face morphs
        faceShape: creatorConfig.face.faceShape,
        jawline: creatorConfig.face.jawline,
        cheekbones: creatorConfig.face.cheekbones,
        chinShape: creatorConfig.face.chinShape,
        eyeSize: creatorConfig.face.eyeSize,
        eyeSpacing: creatorConfig.face.eyeSpacing,
        eyeHeight: creatorConfig.face.eyeHeight,
        eyeAngle: creatorConfig.face.eyeAngle,
        eyelidShape: creatorConfig.face.eyelidShape,
        eyebrowThickness: creatorConfig.face.eyebrowThickness,
        eyebrowAngle: creatorConfig.face.eyebrowAngle,
        noseSize: creatorConfig.face.noseSize,
        noseWidth: creatorConfig.face.noseWidth,
        noseHeight: creatorConfig.face.noseHeight,
        bridgeWidth: creatorConfig.face.bridgeWidth,
        nostrilSize: creatorConfig.face.nostrilSize,
        noseTip: creatorConfig.face.noseTip,
        mouthSize: creatorConfig.face.mouthSize,
        mouthWidth: creatorConfig.face.mouthWidth,
        lipThickness: creatorConfig.face.lipThickness,
        lipShape: creatorConfig.face.lipShape,
        cupidBow: creatorConfig.face.cupidBow,
        mouthAngle: creatorConfig.face.mouthAngle,
      },
      materialOverrides: {
        skin: {
          slot: 'skin',
          type: 'color',
          value: creatorConfig.skin.tone,
          opacity: 1.0,
          roughness: 1.0 - creatorConfig.skin.glossiness,
        },
        hair: {
          slot: 'hair',
          type: 'color',
          value: creatorConfig.hair.color.primary,
          opacity: 1.0,
        },
      },
      contentRating: creatorConfig.nsfw?.enabled ? 'nsfw' : 'sfw',
      showNsfwContent: creatorConfig.nsfw?.enabled ?? false,
      ageVerified: creatorConfig.nsfw?.enabled ?? false,
      defaultAnimation: 'idle',
      idleAnimations: ['idle', 'idle_2', 'idle_3'],
      allowExport: true,
      exportFormat: 'glb',
      createdAt: new Date(creatorConfig.createdAt),
      updatedAt: new Date(creatorConfig.updatedAt),
    };
  };

  // Convert AvatarConfiguration to CreatorAvatarConfig
  const convertToCreatorConfig = (
    config: AvatarConfiguration,
    userId: string,
  ): CreatorAvatarConfig => {
    return {
      id: config.id || `avatar-${Date.now()}`,
      userId,
      name: `Avatar ${new Date().toLocaleDateString()}`,
      version: '1.0.0',
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
      baseModel: config.baseModel,
      baseModelUrl: config.baseModelUrl,
      body: {
        height: config.morphTargets.height ?? 1.0,
        weight: config.morphTargets.weight ?? 1.0,
        muscleMass: config.morphTargets.muscleMass ?? 0.5,
        bodyFat: config.morphTargets.bodyFat ?? 0.5,
        shoulderWidth: config.morphTargets.shoulderWidth ?? 1.0,
        chestSize: config.morphTargets.chestSize ?? 1.0,
        waistSize: config.morphTargets.waistSize ?? 1.0,
        hipWidth: config.morphTargets.hipWidth ?? 1.0,
        armLength: config.morphTargets.armLength ?? 1.0,
        legLength: config.morphTargets.legLength ?? 1.0,
        thighSize: config.morphTargets.thighSize ?? 1.0,
        calfSize: config.morphTargets.calfSize ?? 1.0,
        headSize: config.morphTargets.headSize ?? 1.0,
        neckLength: config.morphTargets.neckLength ?? 1.0,
      },
      face: {
        faceShape: config.morphTargets.faceShape ?? 0.5,
        jawline: config.morphTargets.jawline ?? 0.5,
        cheekbones: config.morphTargets.cheekbones ?? 0.5,
        chinShape: config.morphTargets.chinShape ?? 0.5,
        eyeSize: config.morphTargets.eyeSize ?? 1.0,
        eyeSpacing: config.morphTargets.eyeSpacing ?? 1.0,
        eyeHeight: config.morphTargets.eyeHeight ?? 1.0,
        eyeAngle: config.morphTargets.eyeAngle ?? 0.0,
        eyelidShape: config.morphTargets.eyelidShape ?? 0.5,
        eyeColor: '#4a90e2',
        eyebrowThickness: config.morphTargets.eyebrowThickness ?? 1.0,
        eyebrowAngle: config.morphTargets.eyebrowAngle ?? 0.0,
        noseSize: config.morphTargets.noseSize ?? 1.0,
        noseWidth: config.morphTargets.noseWidth ?? 1.0,
        noseHeight: config.morphTargets.noseHeight ?? 1.0,
        bridgeWidth: config.morphTargets.bridgeWidth ?? 1.0,
        nostrilSize: config.morphTargets.nostrilSize ?? 1.0,
        noseTip: config.morphTargets.noseTip ?? 0.5,
        mouthSize: config.morphTargets.mouthSize ?? 1.0,
        mouthWidth: config.morphTargets.mouthWidth ?? 1.0,
        lipThickness: config.morphTargets.lipThickness ?? 1.0,
        lipShape: config.morphTargets.lipShape ?? 0.5,
        cupidBow: config.morphTargets.cupidBow ?? 0.5,
        mouthAngle: config.morphTargets.mouthAngle ?? 0.0,
      },
      skin: {
        tone:
          typeof config.materialOverrides.skin?.value === 'string'
            ? config.materialOverrides.skin.value
            : '#fdbcb4',
        texture: 0.5,
        blemishes: 0.0,
        freckles: 0.0,
        ageSpots: 0.0,
        wrinkles: 0.0,
        glossiness: 1.0 - (config.materialOverrides.skin?.roughness ?? 0.5),
      },
      hair: {
        style: config.parts.hair || 'default',
        length: 0.5,
        volume: 1.0,
        texture: 0.5,
        color: {
          primary:
            typeof config.materialOverrides.hair?.value === 'string'
              ? config.materialOverrides.hair.value
              : '#8B4513',
          gradient: false,
        },
        highlights: {
          enabled: false,
          color: '#ffffff',
          intensity: 0.0,
          pattern: 'streaks',
        },
      },
      parts: Object.entries(config.parts).reduce(
        (acc, [key, value]) => {
          if (value) {
            // Convert lowercase to PascalCase for CreatorAvatarConfig
            const partKey = key.charAt(0).toUpperCase() + key.slice(1);
            acc[partKey] = value;
          }
          return acc;
        },
        {} as Record<string, string | undefined>,
      ),
      materials: {
        shader: 'AnimeToon',
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
      nsfw: config.showNsfwContent
        ? {
            enabled: true,
            features: {
              anatomyDetail: 0.5,
              arousalIndicators: false,
              interactionLevel: 'basic',
            },
          }
        : undefined,
    };
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-pink-200 mb-4">Loading CREATOR...</div>
          <div className="text-white/60">Preparing your avatar creation experience</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black">
      {/* Top Toolbar */}
      <div className="sticky top-0 z-50 border-b border-white/20 bg-black/40 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <HeaderButton
                onClick={() => router.push('/mini-games')}
                className="text-white/80 hover:text-white"
              >
                ← Back to Games
              </HeaderButton>
              <h1 className="text-2xl font-bold text-pink-200">CREATOR</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Save Status */}
              {saveStatus === 'saving' && <span className="text-sm text-white/60">Saving...</span>}
              {saveStatus === 'saved' && <span className="text-sm text-emerald-400">Saved!</span>}
              {saveStatus === 'error' && <span className="text-sm text-red-400">Save failed</span>}
              {hasUnsavedChanges && saveStatus === 'idle' && (
                <span className="text-sm text-amber-400">Unsaved changes</span>
              )}

              {/* Save Button */}
              <HeaderButton
                onClick={handleSave}
                disabled={saveStatus === 'saving' || !hasUnsavedChanges}
                className="bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Avatar
              </HeaderButton>
            </div>
          </div>
        </div>
      </div>

      {/* Main Creator Interface */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <GlassCard className="p-6">
          <GlassCardContent>
            <CharacterEditor
              initialConfiguration={avatarConfig || undefined}
              onConfigurationChange={handleConfigurationChange}
              onSave={handleSave}
            />
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}
