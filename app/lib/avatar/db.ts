/**
 * Avatar asset database access layer
 * Provides typed interfaces for Prisma queries to AvatarPart table
 */

import type { EquipmentSlotType } from '@om/avatar';

// Dynamic import to avoid circular dependencies
async function getDb() {
  const { db } = await import('@/lib/db');
  return db;
}

export interface AssetRecord {
  id: string;
  url: string;
  contentRating: 'sfw' | 'nsfw';
  slot: EquipmentSlotType;
  name: string;
  type: string;
}

/**
 * Retrieves a single avatar asset by ID
 */
export async function getAssetById(id: string): Promise<AssetRecord | null> {
  const db = await getDb();
  const part = await db.avatarPart.findUnique({
    where: { id },
    select: {
      id: true,
      modelUrl: true,
      contentRating: true,
      type: true,
      name: true,
    },
  });

  if (!part) {
    return null;
  }

  return {
    id: part.id,
    url: part.modelUrl,
    contentRating: part.contentRating as 'sfw' | 'nsfw',
    slot: part.type as EquipmentSlotType,
    name: part.name,
    type: part.type,
  };
}

/**
 * Retrieves multiple avatar assets by IDs in a single query
 */
export async function getAssetsByIds(ids: string[]): Promise<Map<string, AssetRecord>> {
  const db = await getDb();
  const parts = await db.avatarPart.findMany({
    where: {
      id: { in: ids },
    },
    select: {
      id: true,
      modelUrl: true,
      contentRating: true,
      type: true,
      name: true,
    },
  });

  const map = new Map<string, AssetRecord>();
  for (const part of parts) {
    map.set(part.id, {
      id: part.id,
      url: part.modelUrl,
      contentRating: part.contentRating as 'sfw' | 'nsfw',
      slot: part.type as EquipmentSlotType,
      name: part.name,
      type: part.type,
    });
  }

  return map;
}

/**
 * Gets a safe fallback asset for a given equipment slot
 */
export async function getFallbackForSlot(slot: string): Promise<AssetRecord> {
  // Try to find a default SFW asset for this slot
  const db = await getDb();
  const part = await db.avatarPart.findFirst({
    where: {
      type: slot,
      isDefault: true,
      contentRating: 'sfw',
    },
    select: {
      id: true,
      modelUrl: true,
      contentRating: true,
      type: true,
      name: true,
    },
  });

  if (part) {
    return {
      id: part.id,
      url: part.modelUrl,
      contentRating: part.contentRating as 'sfw' | 'nsfw',
      slot: part.type as EquipmentSlotType,
      name: part.name,
      type: part.type,
    };
  }

  // Ultimate fallback: return a placeholder
  return {
    id: `fallback-${slot}`,
    url: `https://assets.otakumori.com/fallback/${slot.toLowerCase()}.glb`,
    contentRating: 'sfw',
    slot: slot as EquipmentSlotType,
    name: `Default ${slot}`,
    type: slot,
  };
}

/**
 * Cache for fallback assets to reduce DB queries
 */
const fallbackCache = new Map<string, AssetRecord>();

/**
 * Gets a cached fallback for better performance
 */
export async function getCachedFallbackForSlot(slot: string): Promise<AssetRecord> {
  if (fallbackCache.has(slot)) {
    return fallbackCache.get(slot)!;
  }

  const fallback = await getFallbackForSlot(slot);
  fallbackCache.set(slot, fallback);
  return fallback;
}
