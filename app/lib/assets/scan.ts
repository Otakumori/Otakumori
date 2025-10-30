/**
 * Asset scanner - Walks /assets/** and detects assets
 * Run with: pnpm assets:scan
 */

import { createHash } from 'crypto';
import { readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';
import { basename, relative } from 'path';

export interface ScannedAsset {
  id: string;
  path: string;
  filename: string;
  slot: string | null;
  nsfw: boolean;
  hash: string;
  size: number;
  mtime: number;
}

export interface ScanResults {
  scannedAt: string;
  totalAssets: number;
  assets: ScannedAsset[];
}

const SUPPORTED_EXTENSIONS = ['.glb', '.gltf', '.ktx2', '.png', '.jpg', '.jpeg'];
const ASSET_ROOT = 'public/assets';

/**
 * Main scan function
 */
async function scanAssets(): Promise<ScanResults> {
  console.warn('🔍 Scanning assets...');

  // Find all supported files
  const pattern = `${ASSET_ROOT}/**/*.{glb,gltf,ktx2,png,jpg,jpeg}`;
  const files = await glob(pattern, { nodir: true });

  console.warn(`Found ${files.length} asset files`);

  const assets: ScannedAsset[] = [];

  for (const filePath of files) {
    try {
      const asset = await processFile(filePath);
      if (asset) {
        assets.push(asset);
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  }

  return {
    scannedAt: new Date().toISOString(),
    totalAssets: assets.length,
    assets,
  };
}

/**
 * Process a single file
 */
async function processFile(filePath: string): Promise<ScannedAsset | null> {
  const filename = basename(filePath);
  const relativePath = relative('public', filePath);

  // Detect NSFW from path
  const nsfw = filePath.includes('/nsfw/') || filePath.includes('/adults/');

  // Detect slot from filename prefix
  const slot = detectSlot(filename);

  // Generate ID from filename (without extension)
  const id = filename.replace(/\.[^.]+$/, '');

  // Compute hash
  const content = await readFile(filePath);
  const hash = createHash('sha256').update(content).digest('hex');

  // Get file stats
  const stats = await import('fs/promises').then((fs) => fs.stat(filePath));

  return {
    id,
    path: `/${relativePath}`,
    filename,
    slot,
    nsfw,
    hash,
    size: stats.size,
    mtime: stats.mtimeMs,
  };
}

/**
 * Detect asset slot from filename
 */
function detectSlot(filename: string): string | null {
  const lower = filename.toLowerCase();

  if (lower.startsWith('head_')) return 'Head';
  if (lower.startsWith('torso_')) return 'Torso';
  if (lower.startsWith('legs_')) return 'Legs';
  if (lower.startsWith('accessory_')) return 'Accessory';
  if (lower.startsWith('body_')) return 'Body';

  return null;
}

/**
 * Save scan results
 */
async function saveScanResults(results: ScanResults): Promise<void> {
  const outputPath = 'app/lib/assets/scan-results.json';
  await writeFile(outputPath, JSON.stringify(results, null, 2));
  console.warn(`✅ Scan results saved to ${outputPath}`);
  console.warn(`   Total assets: ${results.totalAssets}`);
  console.warn(`   NSFW: ${results.assets.filter((a) => a.nsfw).length}`);
  console.warn(`   Safe: ${results.assets.filter((a) => !a.nsfw).length}`);
}

/**
 * Main execution
 */
async function main() {
  try {
    const results = await scanAssets();
    await saveScanResults(results);
  } catch (error) {
    console.error('❌ Scan failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { scanAssets, saveScanResults };
