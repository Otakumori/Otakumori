/**
 * Asset registry types and runtime loader
 */
export type AssetSlot = 'Head' | 'Torso' | 'Legs' | 'Accessory';
export type AssetHost = 'local' | 'cdn';
export type AssetCoverage = 'standard' | 'minimal' | 'full';
export interface AssetMeta {
  id: string;
  slot: AssetSlot;
  nsfw: boolean;
  url: string;
  host: AssetHost;
  hash: string;
  coverage: AssetCoverage;
}
export interface AssetRegistry {
  version: number;
  assets: Record<string, AssetMeta>;
  fallbacks: Record<AssetSlot, string>;
}
/**
 * Load asset registry from JSON
 */
export declare function loadRegistry(): Promise<AssetRegistry>;
/**
 * Get asset by ID
 */
export declare function getAsset(registry: AssetRegistry, id: string): AssetMeta | undefined;
/**
 * List assets by slot
 */
export declare function listAssetsBySlot(
  registry: AssetRegistry,
  slot: AssetSlot,
  options?: {
    nsfw?: boolean;
  },
): AssetMeta[];
/**
 * Get fallback asset for a slot
 */
export declare function getFallback(
  registry: AssetRegistry,
  slot: AssetSlot,
): AssetMeta | undefined;
/**
 * Get safe alternative for an asset
 */
export declare function getSafeAlternative(
  registry: AssetRegistry,
  assetId: string,
): AssetMeta | undefined;
/**
 * Validate registry
 */
export declare function validateRegistry(registry: AssetRegistry): {
  valid: boolean;
  errors: string[];
};
//# sourceMappingURL=registry.d.ts.map
