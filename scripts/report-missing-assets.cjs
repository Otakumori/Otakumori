const fs = require('fs');
const path = require('path');

function write(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text, 'utf-8');
}

function loadManifest() {
  const manifestPath = path.join(process.cwd(), 'content', 'assets.manifest.json');
  const raw = fs.readFileSync(manifestPath, 'utf-8');
  return JSON.parse(raw);
}

function fileExistsInPublic(url) {
  if (!url?.startsWith('/')) return true; // external or bucket URLs assumed available at runtime
  const abs = path.join(process.cwd(), 'public', url.replace(/^\//, ''));
  return fs.existsSync(abs);
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

(async () => {
  const out = [];
  const hdr = (s) => out.push(`\n## ${s}\n`);
  const item = (s) => out.push(`- [ ] ${s}`);

  out.push(`# ASSET TODO (auto-generated)\n`);
  out.push(`Run \`npm run assets:check\` after adding images to verify.\n`);

  const m = loadManifest();

  hdr('OpenGraph Images');
  const ogDef = m.og?.default;
  if (!ogDef) item('Create `/public/og/default-og.png` (1200×630) + add alt in manifest');
  else if (!fileExistsInPublic(ogDef.url))
    item(`Missing: ${ogDef.url} (alt: "${ogDef.alt ?? '—'}")`);
  else out.push(`- [x] default OG present: \`${ogDef.url}\``);

  const ogTpl = m.og?.productTemplate;
  if (ogTpl && !fileExistsInPublic(ogTpl.url)) item(`Missing: ${ogTpl.url} (product OG template)`);

  hdr('Category Banners');
  for (const [slug, v] of Object.entries(m.categories ?? {})) {
    const banner = v?.banner;
    if (!banner?.url || !banner?.alt)
      item(`Add banner for "${slug}" → /public/banners/${slug}.jpg (+ alt in manifest)`);
    else if (!fileExistsInPublic(banner.url))
      item(`Missing banner: ${banner.url} (alt: "${banner.alt}")`);
    else out.push(`- [x] ${slug} → \`${banner.url}\``);
  }

  hdr('PDP Overrides (optional)');
  out.push(
    `If using Printify CDN, skip. For static overrides, place under \`/public/products/<slug>/<n>.jpg\` and wire PDP loader.`,
  );

  // Also call strict checker so CI surfaces missing paths
  const missing = checkFilesExist(m);
  if (missing.length) {
    out.push(`\n**Missing public files detected:**\n- ${missing.join('\n- ')}`);
  }

  const dest = path.join(process.cwd(), 'content', 'ASSET_TODO.md');
  write(dest, out.join('\n'));
  console.log(`[assets] Wrote checklist → ${dest}`);
})();
