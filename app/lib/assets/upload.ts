/**
 * Asset Upload Script
 *
 * Uploads processed assets to Vercel Blob storage and updates registry with URLs.
 * Run with: pnpm assets:upload
 *
 * Safe assets (nsfw: false) → public access (direct CDN URLs)
 * NSFW assets (nsfw: true) → private access (proxy URLs)
 */

import fs from 'node:fs';
import path from 'node:path';
import { putBlobFile } from '@/app/lib/blob/client';

interface AssetEntry {
  id: string;
  slot: string;
  nsfw: boolean;
  url?: string;
  host?: string;
  hash: string;
  coverage?: string;
}

interface AssetRegistry {
  version: number;
  assets: Record<string, AssetEntry>;
  fallbacks: Record<string, string>;
}

const REGISTRY_PATH = path.join(process.cwd(), 'app/lib/assets/registry.json');
const ASSET_ROOT = path.join(process.cwd(), 'public/assets');

/**
 * Exit with error message
 */
function exitWith(message: string): never {
  console.error(`❌ ${message}`);
  process.exit(1);
}

/**
 * Determine file extension from asset ID
 */
function getExtension(id: string): string {
  // Try to detect from ID or default to .glb
  if (id.includes('.')) {
    return id.substring(id.lastIndexOf('.'));
  }
  // Default extensions by common patterns
  if (id.includes('texture') || id.includes('thumb')) return '.png';
  if (id.includes('model') || id.includes('avatar')) return '.glb';
  return '.bin';
}

/**
 * Determine content type from extension
 */
function getContentType(ext: string): string {
  const types: Record<string, string> = {
    '.glb': 'model/gltf-binary',
    '.gltf': 'model/gltf+json',
    '.ktx2': 'image/ktx2',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
  };
  return types[ext.toLowerCase()] || 'application/octet-stream';
}

/**
 * Find file path for asset
 */
function findAssetFile(entry: AssetEntry): string | null {
  // Try multiple possible locations
  const possiblePaths = [
    path.join(ASSET_ROOT, 'models', entry.slot, `${entry.id}.glb`),
    path.join(ASSET_ROOT, 'models', `${entry.id}.glb`),
    path.join(ASSET_ROOT, entry.slot, `${entry.id}.glb`),
    path.join(ASSET_ROOT, entry.slot, `${entry.id}.png`),
    path.join(ASSET_ROOT, `${entry.id}.glb`),
    path.join(ASSET_ROOT, `${entry.id}.png`),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  return null;
}

/**
 * Main upload function
 */
async function main() {
  // eslint-disable-next-line no-console
  console.log('📤 Starting asset upload to Vercel Blob...\n');

  // Check registry exists
  if (!fs.existsSync(REGISTRY_PATH)) {
    exitWith(`Missing registry: ${REGISTRY_PATH}. Run 'pnpm assets:curate' first.`);
  }

  // Load registry
  const raw = fs.readFileSync(REGISTRY_PATH, 'utf-8');
  const registry: AssetRegistry = JSON.parse(raw);

  // eslint-disable-next-line no-console
  console.log(`📋 Loaded registry with ${Object.keys(registry.assets).length} assets\n`);

  let uploadedPublic = 0;
  let uploadedPrivate = 0;
  let skipped = 0;

  // Process each asset
  for (const [id, entry] of Object.entries(registry.assets)) {
    // Skip if already uploaded to blob
    if (entry.host === 'vercel-blob' && entry.url) {
      // eslint-disable-next-line no-console
      console.log(`⏭️  Skipping ${id} (already uploaded)`);
      skipped++;
      continue;
    }

    // Find asset file
    const filePath = findAssetFile(entry);
    if (!filePath) {
      console.warn(`⚠️  Missing file for asset: ${id} (skipping)`);
      skipped++;
      continue;
    }

    // Determine extension and content type
    const ext = path.extname(filePath) || getExtension(id);
    const contentType = getContentType(ext);

    // Generate blob key: slot/id-hash.ext
    const key = `${entry.slot}/${id}-${entry.hash.substring(0, 8)}${ext}`;
    const access = entry.nsfw ? 'private' : 'public';

    try {
      // Read file data
      const data = fs.readFileSync(filePath);

      // Upload to Vercel Blob
      // eslint-disable-next-line no-console
      console.log(`📤 Uploading ${access} asset: ${key}`);
      const { url } = await putBlobFile({ key, data, contentType, access });

      // Update registry entry
      if (access === 'public') {
        entry.url = url; // Direct CDN URL
        entry.host = 'vercel-blob';
        uploadedPublic++;
      } else {
        entry.url = `/api/blob/read?key=${encodeURIComponent(key)}`; // Proxy URL
        entry.host = 'vercel-blob';
        uploadedPrivate++;
      }

      // eslint-disable-next-line no-console
      console.log(`✅ Uploaded: ${id}`);
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message?.includes('Missing required env')) {
        exitWith(
          'Set BLOB_READ_WRITE_TOKEN and BLOB_PUBLIC_BASE_URL in .env.local.\n' +
            'Vercel: Storage → Blob → Create Token → Read-Write.',
        );
      }
      console.error(`❌ Failed to upload ${id}:`, error.message);
      skipped++;
    }
  }

  // Save updated registry
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2) + '\n');

  // Print summary
  // eslint-disable-next-line no-console
  console.log('\n' + '='.repeat(50));
  // eslint-disable-next-line no-console
  console.log('📊 Upload Summary:');
  // eslint-disable-next-line no-console
  console.log(`   Public assets:  ${uploadedPublic}`);
  // eslint-disable-next-line no-console
  console.log(`   Private assets: ${uploadedPrivate}`);
  // eslint-disable-next-line no-console
  console.log(`   Skipped:        ${skipped}`);
  // eslint-disable-next-line no-console
  console.log(`   Total:          ${uploadedPublic + uploadedPrivate + skipped}`);
  // eslint-disable-next-line no-console
  console.log('='.repeat(50));

  // eslint-disable-next-line no-console
  console.log(`\n✅ Registry updated: ${REGISTRY_PATH}\n`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  });
}

export { main as uploadAssets };
