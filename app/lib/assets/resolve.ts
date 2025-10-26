/**
 * Asset URL Resolver
 *
 * Resolves asset IDs to URLs using the registry.
 * Works transparently for both public CDN URLs and private proxy URLs.
 * Renderer/loader code should use this instead of hardcoding paths.
 */

import registry from './registry.json';

interface AssetMeta {
  id: string;
  slot: string;
  nsfw: boolean;
  url: string;
  host: string;
  hash: string;
  coverage?: string;
}

type AssetRegistry = typeof registry;

/**
 * Resolve asset URL by ID
 *
 * @param id - Asset ID (e.g., "head_001", "torso_casual_shirt")
 * @returns Asset URL (CDN URL for public, proxy URL for private)
 * @throws {Error} If asset not found in registry
 */
export function resolveAssetUrl(id: string): string {
  const assets = (registry as AssetRegistry).assets as Record<string, AssetMeta>;
  const asset = assets[id];

  if (!asset) {
    throw new Error(`Asset not found in registry: ${id}`);
  }

  if (!asset.url) {
    throw new Error(`Asset has no URL: ${id}. Run 'pnpm assets:upload' first.`);
  }

  return asset.url;
}

/**
 * Resolve multiple asset URLs at once
 *
 * @param ids - Array of asset IDs
 * @returns Map of ID to URL
 * @throws {Error} If any asset not found
 */
export function resolveAssetUrls(ids: string[]): Record<string, string> {
  const result: Record<string, string> = {};

  for (const id of ids) {
    result[id] = resolveAssetUrl(id);
  }

  return result;
}

/**
 * Get asset metadata by ID
 *
 * @param id - Asset ID
 * @returns Asset metadata object
 * @throws {Error} If asset not found
 */
export function getAssetMeta(id: string): AssetMeta {
  const assets = (registry as AssetRegistry).assets as Record<string, AssetMeta>;
  const asset = assets[id];

  if (!asset) {
    throw new Error(`Asset not found in registry: ${id}`);
  }

  return asset;
}

/**
 * Check if asset exists in registry
 *
 * @param id - Asset ID
 * @returns True if asset exists
 */
export function hasAsset(id: string): boolean {
  const assets = (registry as AssetRegistry).assets as Record<string, AssetMeta>;
  return id in assets;
}

/**
 * Get all assets for a specific slot
 *
 * @param slot - Slot name (e.g., "Head", "Torso", "Legs")
 * @returns Array of asset IDs in that slot
 */
export function getAssetsBySlot(slot: string): string[] {
  const assets = (registry as AssetRegistry).assets as Record<string, AssetMeta>;
  return Object.entries(assets)
    .filter(([, asset]) => asset.slot === slot)
    .map(([id]) => id);
}

/**
 * Get fallback asset ID for a slot
 *
 * @param slot - Slot name
 * @returns Fallback asset ID for the slot
 * @throws {Error} If no fallback exists for slot
 */
export function getFallbackAsset(slot: string): string {
  const fallbacks = (registry as AssetRegistry).fallbacks as Record<string, string>;
  const fallbackId = fallbacks[slot];

  if (!fallbackId) {
    throw new Error(`No fallback asset for slot: ${slot}`);
  }

  return fallbackId;
}

/**
 * Resolve fallback asset URL for a slot
 *
 * @param slot - Slot name
 * @returns URL of fallback asset
 */
export function resolveFallbackUrl(slot: string): string {
  const fallbackId = getFallbackAsset(slot);
  return resolveAssetUrl(fallbackId);
}
