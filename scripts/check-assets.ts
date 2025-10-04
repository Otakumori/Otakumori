import { loadManifest, validateManifest, checkFilesExist } from '@/lib/assets/loader';

try {
  const m = loadManifest();
  validateManifest(m as any);
  const missing = checkFilesExist(m as any);
  if (missing.length) {
    console.error('[assets] Missing files in public/:', missing);
    process.exit(1);
  }
  // '[assets] OK'
} catch (e) {
  console.error('[assets] Invalid manifest:', e);
  process.exit(1);
}
