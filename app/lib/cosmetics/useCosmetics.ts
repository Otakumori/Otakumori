/**
 * Cosmetics Hook
 * Manages unlocked cosmetics and selected HUD skin via localStorage
 * Ready for future backend sync when user auth is added
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { HudSkinId } from './cosmeticsConfig';

const STORAGE_KEY_UNLOCKED = 'om_cosmetics_unlocked';
const STORAGE_KEY_HUD_SKIN = 'om_cosmetics_hud_skin';

/**
 * Load unlocked cosmetic IDs from localStorage
 */
function loadUnlockedIds(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY_UNLOCKED);
    if (stored) {
      return JSON.parse(stored) as string[];
    }
  } catch (error) {
    console.warn('Failed to load unlocked cosmetics:', error);
  }

  return [];
}

/**
 * Save unlocked cosmetic IDs to localStorage
 */
function saveUnlockedIds(ids: string[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY_UNLOCKED, JSON.stringify(ids));
  } catch (error) {
    console.warn('Failed to save unlocked cosmetics:', error);
  }
}

/**
 * Load selected HUD skin from localStorage
 */
function loadHudSkin(): HudSkinId {
  if (typeof window === 'undefined') return 'default';

  try {
    const stored = localStorage.getItem(STORAGE_KEY_HUD_SKIN);
    if (stored && (stored === 'default' || stored === 'quake')) {
      return stored as HudSkinId;
    }
  } catch (error) {
    console.warn('Failed to load HUD skin:', error);
  }

  return 'default';
}

/**
 * Save selected HUD skin to localStorage
 */
function saveHudSkin(skinId: HudSkinId): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY_HUD_SKIN, skinId);
  } catch (error) {
    console.warn('Failed to save HUD skin:', error);
  }
}

/**
 * Hook for managing cosmetics
 * Provides unlocked items, HUD skin selection, and unlock/select functions
 * For authenticated users: syncs with backend. For guests: uses localStorage only.
 */
export function useCosmetics() {
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [hudSkin, setHudSkin] = useState<HudSkinId>('default');
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Hydrate from backend (if authenticated) or localStorage (if guest)
  useEffect(() => {
    const hydrate = async () => {
      try {
        // Try to fetch from backend first
        const response = await fetch('/api/v1/cosmetics');
        if (response.ok) {
          const data = await response.json();
          if (data.ok && data.data) {
            // Authenticated user - use backend data
            setUnlockedIds(data.data.unlocked || []);
            setHudSkin(data.data.equipped?.hudSkinId || 'default');
            setIsAuthenticated(true);

            // Also sync to localStorage for fast access
            saveUnlockedIds(data.data.unlocked || []);
            if (data.data.equipped?.hudSkinId) {
              saveHudSkin(data.data.equipped.hudSkinId);
            }

            setIsHydrated(true);
            return;
          }
        }
      } catch {
        // Not authenticated or API error - fall back to localStorage
        // Silently fall back - this is expected for guests
      }

      // Guest user or API unavailable - use localStorage
      const loadedIds = loadUnlockedIds();
      const loadedSkin = loadHudSkin();
      setUnlockedIds(loadedIds);
      setHudSkin(loadedSkin);
      setIsAuthenticated(false);
      setIsHydrated(true);
    };

    hydrate();
  }, []);

  /**
   * Unlock a cosmetic item
   * Adds to unlocked list and persists to localStorage
   * For authenticated users, backend inventory is updated by purchase API
   * This function updates local state and refetches from backend if authenticated
   */
  const unlockItem = useCallback(
    async (itemId: string) => {
      setUnlockedIds((prev) => {
        if (prev.includes(itemId)) {
          return prev; // Already unlocked
        }
        const updated = [...prev, itemId];
        saveUnlockedIds(updated);

        // If authenticated, refetch from backend to sync (purchase API already created inventoryItem)
        if (isAuthenticated) {
          fetch('/api/v1/cosmetics')
            .then((res) => res.json())
            .then((data) => {
              if (data.ok && data.data) {
                setUnlockedIds(data.data.unlocked || []);
                saveUnlockedIds(data.data.unlocked || []);
              }
            })
            .catch(() => {
              // Sync failed - keep local update
            });
        }

        return updated;
      });
    },
    [isAuthenticated],
  );

  /**
   * Select a HUD skin
   * Updates selection and persists to backend (if authenticated) or localStorage (if guest)
   */
  const selectHudSkin = useCallback(
    async (skinId: HudSkinId) => {
      setHudSkin(skinId);
      saveHudSkin(skinId); // Always save to localStorage for fast access

      // If authenticated, sync to backend
      if (isAuthenticated) {
        try {
          await fetch('/api/v1/cosmetics/equip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hudSkinId: skinId }),
          });
        } catch (error) {
          console.error('Failed to sync HUD skin to backend:', error);
          // Continue anyway - localStorage is updated
        }
      }
    },
    [isAuthenticated],
  );

  /**
   * Check if a cosmetic item is unlocked
   */
  const isUnlocked = useCallback(
    (itemId: string) => {
      return unlockedIds.includes(itemId);
    },
    [unlockedIds],
  );

  return {
    unlockedIds,
    hudSkin,
    isHydrated,
    unlockItem,
    selectHudSkin,
    isUnlocked,
  };
}
