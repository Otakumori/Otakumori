/**
 * Avatar Store - Global State Management
 * Manages avatar customization, NSFW settings, and context adaptations
 */

import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as THREE from 'three';
import type { BodyParameters } from '@/app/lib/3d/procedural-body';
import type { HairParameters } from '@/app/lib/3d/procedural-hair';

export type AvatarCategory = 'body' | 'face' | 'hair' | 'clothing' | 'accessories' | 'nsfw';

export interface AvatarPart {
  id: string;
  name: string;
  category: AvatarCategory;
  textureUrl?: string;
  proceduralSeed?: string;
  isNSFW: boolean;
  variants?: {
    id: string;
    name: string;
    textureUrl?: string;
  }[];
}

export type AvatarPartKey = 'body' | 'face' | 'hair' | 'clothing';

export interface FaceParameters {
  eyeSize: number; // 0.7 to 1.5
  eyeShape: 'round' | 'almond' | 'sharp';
  eyeSpacing: number; // 0.8 to 1.2
  noseSize: number; // 0.5 to 1.2
  mouthSize: number; // 0.7 to 1.3
  jawShape: 'soft' | 'angular' | 'round';
  cheekbones: number; // 0 to 1
}

export interface ProceduralAvatarConfig {
  enabled: boolean; // If false, use traditional part-based system
  body: BodyParameters;
  face: FaceParameters;
  hair: HairParameters;
}

export interface AvatarCustomization {
  body: string | null; // Part ID (legacy/hybrid)
  face: string | null;
  hair: string | null;
  clothing: string | null;
  accessories: string[];
  nsfw: {
    enabled: boolean;
    parts: string[];
  };
  colors: {
    skin: string;
    hair: string;
    eyes: string;
  };
  contextAdaptation: {
    enabled: boolean;
    currentContext: 'default' | 'game' | 'combat' | 'social';
  };
  // NEW: Procedural configuration
  procedural?: ProceduralAvatarConfig;
}

interface AvatarStore {
  // Current avatar configuration
  avatar: AvatarCustomization;

  // Available parts library
  availableParts: AvatarPart[];

  // Settings
  nsfwEnabled: boolean;
  showNSFWCategories: boolean;

  // Actions
  updateAvatarPart: (category: AvatarCategory, partId: string) => void;
  addAccessory: (partId: string) => void;
  removeAccessory: (partId: string) => void;
  updateColor: (type: 'skin' | 'hair' | 'eyes', color: string) => void;
  toggleNSFW: () => void;
  setNSFWCategories: (show: boolean) => void;
  setContextAdaptation: (
    context: AvatarCustomization['contextAdaptation']['currentContext'],
  ) => void;
  resetAvatar: () => void;
  loadPreset: (presetId: string) => void;

  // NEW: Procedural avatar actions
  setProceduralConfig: (config: ProceduralAvatarConfig) => void;
  updateBodyParam: <K extends keyof BodyParameters>(key: K, value: BodyParameters[K]) => void;
  updateHairParam: <K extends keyof HairParameters>(key: K, value: HairParameters[K]) => void;
  enableProceduralMode: () => void;
  disableProceduralMode: () => void;
}

const DEFAULT_AVATAR: AvatarCustomization = {
  body: 'default-body',
  face: 'default-face',
  hair: 'default-hair',
  clothing: 'default-outfit',
  accessories: [],
  nsfw: {
    enabled: false,
    parts: [],
  },
  colors: {
    skin: '#FFD5B5',
    hair: '#3D2817',
    eyes: '#4A90E2',
  },
  contextAdaptation: {
    enabled: true,
    currentContext: 'default',
  },
};

export const useAvatarStore = create<AvatarStore>()(
  persist(
    (set) => ({
      avatar: DEFAULT_AVATAR,
      availableParts: [],
      nsfwEnabled: false,
      showNSFWCategories: false,

      updateAvatarPart: (category, partId) =>
        set((state) => {
          if (category === 'accessories' || category === 'nsfw') {
            // Accessories and NSFW are handled separately
            return state;
          }

          const validCategories: AvatarPartKey[] = ['body', 'face', 'hair', 'clothing'];
          if (!validCategories.includes(category as AvatarPartKey)) {
            return state;
          }

          return {
            avatar: {
              ...state.avatar,
              [category]: partId,
            },
          };
        }),

      addAccessory: (partId) =>
        set((state) => ({
          avatar: {
            ...state.avatar,
            accessories: [...state.avatar.accessories, partId],
          },
        })),

      removeAccessory: (partId) =>
        set((state) => ({
          avatar: {
            ...state.avatar,
            accessories: state.avatar.accessories.filter((id) => id !== partId),
          },
        })),

      updateColor: (type, color) =>
        set((state) => ({
          avatar: {
            ...state.avatar,
            colors: {
              ...state.avatar.colors,
              [type]: color,
            },
          },
        })),

      toggleNSFW: () =>
        set((state) => ({
          nsfwEnabled: !state.nsfwEnabled,
          avatar: {
            ...state.avatar,
            nsfw: {
              ...state.avatar.nsfw,
              enabled: !state.nsfwEnabled,
            },
          },
        })),

      setNSFWCategories: (show) => set({ showNSFWCategories: show }),

      setContextAdaptation: (context) =>
        set((state) => ({
          avatar: {
            ...state.avatar,
            contextAdaptation: {
              ...state.avatar.contextAdaptation,
              currentContext: context,
            },
          },
        })),

      resetAvatar: () =>
        set({
          avatar: DEFAULT_AVATAR,
        }),

      loadPreset: (presetId) => {
        // Avatar presets - can be extended with database presets later
        const presets: Record<string, AvatarCustomization> = {
          default: DEFAULT_AVATAR,
          anime: {
            ...DEFAULT_AVATAR,
            hair: 'anime-spiky',
            face: 'anime-large-eyes',
            clothing: 'school-uniform',
          },
          cyberpunk: {
            ...DEFAULT_AVATAR,
            hair: 'cyber-mohawk',
            clothing: 'tech-jacket',
            accessories: ['visor', 'implants'],
          },
          fantasy: {
            ...DEFAULT_AVATAR,
            hair: 'long-flowing',
            clothing: 'fantasy-robes',
            accessories: ['staff', 'amulet'],
          },
        };

        const preset = presets[presetId];
        if (preset) {
          set({ avatar: preset });
        } else {
          logger.warn(`Avatar preset "${presetId}" not found, using default`);
          set({ avatar: DEFAULT_AVATAR });
        }
      },

      // NEW: Procedural avatar methods
      setProceduralConfig: (config) =>
        set((state) => ({
          avatar: {
            ...state.avatar,
            procedural: config,
          },
        })),

      updateBodyParam: (key, value) =>
        set((state) => {
          if (!state.avatar.procedural) return state;
          return {
            avatar: {
              ...state.avatar,
              procedural: {
                ...state.avatar.procedural,
                body: {
                  ...state.avatar.procedural.body,
                  [key]: value,
                },
              },
            },
          };
        }),

      updateHairParam: (key, value) =>
        set((state) => {
          if (!state.avatar.procedural) return state;
          return {
            avatar: {
              ...state.avatar,
              procedural: {
                ...state.avatar.procedural,
                hair: {
                  ...state.avatar.procedural.hair,
                  [key]: value,
                },
              },
            },
          };
        }),

      enableProceduralMode: () =>
        set((state) => ({
          avatar: {
            ...state.avatar,
            procedural: state.avatar.procedural || {
              enabled: true,
              body: {
                height: 1.0,
                build: 'athletic',
                neckLength: 1.0,
                shoulderWidth: 1.0,
                chestSize: 1.0,
                waistSize: 0.8,
                hipWidth: 1.0,
                armLength: 1.0,
                legLength: 1.0,
                thighThickness: 1.0,
                muscleDefinition: 1.0,
                anatomyDetail: 'basic',
              },
              face: {
                eyeSize: 1.0,
                eyeShape: 'almond',
                eyeSpacing: 1.0,
                noseSize: 1.0,
                mouthSize: 1.0,
                jawShape: 'soft',
                cheekbones: 0.5,
              },
              hair: {
                style: 'medium',
                color: new THREE.Color(state.avatar.colors.hair),
                length: 0.4,
                volume: 1.0,
                waviness: 0.2,
                bangs: true,
              },
            },
          },
        })),

      disableProceduralMode: () =>
        set((state) => ({
          avatar: {
            ...state.avatar,
            procedural: state.avatar.procedural
              ? { ...state.avatar.procedural, enabled: false }
              : undefined,
          },
        })),
    }),
    {
      name: 'otakumori-avatar-storage',
      partialize: (state) => ({
        avatar: state.avatar,
        nsfwEnabled: state.nsfwEnabled,
      }),
    },
  ),
);
