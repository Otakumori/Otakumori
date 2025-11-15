/**
 * Asset Registry Scanner
 * Scans /public/assets/** for GLB/texture files
 * Detects slot from filename, NSFW from path
 * Computes SHA-256 hash
 */

// Note: This is a Node.js-only module (uses fs, crypto)
// For browser usage, use the loader which fetches pre-scanned registry.json

export interface ScannedAsset {
  id: string;
  path: string;
  filename: string;
  slot: 'Head' | 'Torso' | 'Legs' | 'Accessory' | null;
  nsfw: boolean;
  hash: string;
  size: number;
}

export interface ScanResults {
  scannedAt: string;
  totalAssets: number;
  assets: ScannedAsset[];
}

/**
 * Scan assets from /public/assets/**
 * This function is intended for build-time/CLI use, not runtime
 */
export async function scanAssets(): Promise<ScanResults> {
  // This would use Node.js fs and crypto modules
  // For now, return empty scan results
  // Full implementation would:
  // 1. Use glob to find all .glb, .png, .jpg, .ktx2 files in /public/assets/**
  // 2. Detect slot from filename (head*, torso*, legs*, accessory*)
  // 3. Detect NSFW from path (/nsfw/ or /adults/)
  // 4. Compute SHA-256 hash
  // 5. Return ScanResults

  return {
    scannedAt: new Date().toISOString(),
    totalAssets: 0,
    assets: [],
  };
}

/**
 * Detect slot from filename
 */
export function detectSlot(filename: string): 'Head' | 'Torso' | 'Legs' | 'Accessory' | null {
  const lower = filename.toLowerCase();

  if (lower.startsWith('head_')) return 'Head';
  if (lower.startsWith('torso_')) return 'Torso';
  if (lower.startsWith('legs_')) return 'Legs';
  if (lower.startsWith('accessory_')) return 'Accessory';

  return null;
}

/**
 * Detect NSFW from path
 */
export function detectNsfw(path: string): boolean {
  return path.includes('/nsfw/') || path.includes('/adults/');
}

