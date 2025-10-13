/**
 * Avatar Store - Global State Management
 * Manages avatar customization, NSFW settings, and context adaptations
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export interface AvatarCustomization {
  body: string | null; // Part ID
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
          console.warn(`Avatar preset "${presetId}" not found, using default`);
          set({ avatar: DEFAULT_AVATAR });
        }
      },
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
