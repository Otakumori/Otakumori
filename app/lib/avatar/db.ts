import type { AssetMeta, AssetSlot } from '@om/game-kit';
import { loadRegistry, getAsset, getFallback } from '@om/game-kit';

const fallbackCache = new Map<AssetSlot, AssetMeta>();

export async function getAssetsByIds(ids: string[]): Promise<Map<string, AssetMeta>> {
  const registry = await loadRegistry();
  const result = new Map<string, AssetMeta>();

  ids.forEach((id) => {
    const asset = getAsset(registry, id);
    if (asset) {
      result.set(id, asset);
    }
  });

  return result;
}

export async function getCachedFallbackForSlot(slot: AssetSlot): Promise<AssetMeta> {
  const cached = fallbackCache.get(slot);
  if (cached) {
    return cached;
  }

  const registry = await loadRegistry();
  const fallback = getFallback(registry, slot);

  if (!fallback) {
    throw new Error(`No fallback asset configured for slot ${slot}`);
  }

  fallbackCache.set(slot, fallback);
  return fallback;
}
