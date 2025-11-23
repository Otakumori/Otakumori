/**
 * Guest Character Storage Utilities
 * Handles localStorage-based temporary character storage for guests
 */

import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';

export interface GuestCharacter {
  id: string;
  name: string;
  config: AvatarConfiguration;
  createdAt: number;
  expiresAt: number;
  isTemporary: true;
}

const GUEST_CHARACTER_PREFIX = 'otm-guest-character-';
const GUEST_CHARACTER_LIST_KEY = 'otm-guest-characters-list';
const CHARACTER_EXPIRY_DAYS = 7;
const MAX_GUEST_CHARACTERS = 10;

/**
 * Generate a unique guest character ID
 */
function generateGuestCharacterId(): string {
  return `${GUEST_CHARACTER_PREFIX}${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get all guest character IDs from the list
 */
function getGuestCharacterIds(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(GUEST_CHARACTER_LIST_KEY);
    if (stored) {
      return JSON.parse(stored) as string[];
    }
  } catch (error) {
    console.warn('Failed to load guest character list:', error);
  }

  return [];
}

/**
 * Save guest character IDs list
 */
function saveGuestCharacterIds(ids: string[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(GUEST_CHARACTER_LIST_KEY, JSON.stringify(ids));
  } catch (error) {
    console.warn('Failed to save guest character list:', error);
  }
}

/**
 * Clean up expired guest characters
 */
function cleanupExpiredCharacters(): void {
  if (typeof window === 'undefined') return;

  const ids = getGuestCharacterIds();
  const now = Date.now();
  const validIds: string[] = [];

  ids.forEach((id) => {
    try {
      const stored = localStorage.getItem(id);
      if (stored) {
        const character = JSON.parse(stored) as GuestCharacter;
        if (character.expiresAt > now) {
          validIds.push(id);
        } else {
          localStorage.removeItem(id);
        }
      }
    } catch (error) {
      console.warn(`Failed to check character ${id}:`, error);
      // Remove invalid entries
    }
  });

  if (validIds.length !== ids.length) {
    saveGuestCharacterIds(validIds);
  }
}

/**
 * Save a guest character
 */
export function saveGuestCharacter(
  config: AvatarConfiguration,
  name: string = 'My Character',
): GuestCharacter {
  if (typeof window === 'undefined') {
    throw new Error('localStorage is not available');
  }

  // Clean up expired characters first
  cleanupExpiredCharacters();

  const ids = getGuestCharacterIds();

  // Enforce max character limit
  if (ids.length >= MAX_GUEST_CHARACTERS) {
    // Remove oldest character
    const oldestId = ids.shift();
    if (oldestId) {
      localStorage.removeItem(oldestId);
    }
  }

  const id = generateGuestCharacterId();
  const now = Date.now();
  const expiresAt = now + CHARACTER_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

  const guestCharacter: GuestCharacter = {
    id,
    name,
    config,
    createdAt: now,
    expiresAt,
    isTemporary: true,
  };

  try {
    localStorage.setItem(id, JSON.stringify(guestCharacter));
    ids.push(id);
    saveGuestCharacterIds(ids);
  } catch (error) {
    console.error('Failed to save guest character:', error);
    throw error;
  }

  return guestCharacter;
}

/**
 * Load a guest character by ID
 */
export function loadGuestCharacter(id: string): GuestCharacter | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(id);
    if (stored) {
      const character = JSON.parse(stored) as GuestCharacter;

      // Check if expired
      if (character.expiresAt < Date.now()) {
        localStorage.removeItem(id);
        const ids = getGuestCharacterIds().filter((cid) => cid !== id);
        saveGuestCharacterIds(ids);
        return null;
      }

      return character;
    }
  } catch (error) {
    console.warn(`Failed to load guest character ${id}:`, error);
  }

  return null;
}

/**
 * Get all guest characters
 */
export function getAllGuestCharacters(): GuestCharacter[] {
  if (typeof window === 'undefined') return [];

  cleanupExpiredCharacters();

  const ids = getGuestCharacterIds();
  const characters: GuestCharacter[] = [];

  ids.forEach((id) => {
    const character = loadGuestCharacter(id);
    if (character) {
      characters.push(character);
    }
  });

  // Sort by creation date (newest first)
  return characters.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Delete a guest character
 */
export function deleteGuestCharacter(id: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.removeItem(id);
    const ids = getGuestCharacterIds().filter((cid) => cid !== id);
    saveGuestCharacterIds(ids);
    return true;
  } catch (error) {
    console.warn(`Failed to delete guest character ${id}:`, error);
    return false;
  }
}

/**
 * Update a guest character
 */
export function updateGuestCharacter(
  id: string,
  updates: Partial<Pick<GuestCharacter, 'name' | 'config'>>,
): GuestCharacter | null {
  if (typeof window === 'undefined') return null;

  const character = loadGuestCharacter(id);
  if (!character) return null;

  const updated: GuestCharacter = {
    ...character,
    ...updates,
  };

  try {
    localStorage.setItem(id, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn(`Failed to update guest character ${id}:`, error);
    return null;
  }
}

/**
 * Get the most recently used guest character
 */
export function getMostRecentGuestCharacter(): GuestCharacter | null {
  const characters = getAllGuestCharacters();
  return characters.length > 0 ? characters[0] : null;
}

/**
 * Check if guest has any characters
 */
export function hasGuestCharacters(): boolean {
  return getAllGuestCharacters().length > 0;
}
