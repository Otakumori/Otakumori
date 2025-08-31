const fs = require('fs');
const path = require('path');

function loadManifest() {
  const manifestPath = path.join(process.cwd(), 'content', 'assets.manifest.json');
  const raw = fs.readFileSync(manifestPath, 'utf-8');
  return JSON.parse(raw);
}

function checkFilesExist(manifest) {
  const missing = [];
  const probe = (url) => {
    if (url?.startsWith('/')) {
      const abs = path.join(process.cwd(), 'public', url.replace(/^\//, ''));
      if (!fs.existsSync(abs)) missing.push(url);
    }
  };
  if (manifest.og?.default) probe(manifest.og.default.url);
  if (manifest.og?.productTemplate) probe(manifest.og.productTemplate.url);
  for (const v of Object.values(manifest.categories ?? {})) probe(v.banner?.url);
  return missing;
}

try {
  const m = loadManifest();
  const missing = checkFilesExist(m);
  if (missing.length) {
    console.error('[assets] Missing files in public/:', missing);
    process.exit(1);
  }
  console.log('[assets] OK');
} catch (e) {
  console.error('[assets] Invalid manifest:', e);
  process.exit(1);
}
