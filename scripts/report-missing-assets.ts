import fs from 'node:fs';
import path from 'node:path';
import {
  loadManifest,
  validateManifest,
  checkFilesExist,
  fileExistsInPublic,
} from '@/lib/assets/loader';

function write(file: string, text: string) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text, 'utf-8');
}

(async () => {
  const out: string[] = [];
  const hdr = (s: string) => out.push(`\n## ${s}\n`);
  const item = (s: string) => out.push(`- [ ] ${s}`);

  out.push(`# ASSET TODO (auto-generated)\n`);
  out.push(`Run \`npm run assets:check\` after adding images to verify.\n`);

  const m = loadManifest();
  try {
    validateManifest(m as any);
  } catch (e) {
    out.push(`**Manifest validation failed:**\n\n\`\`\`\n${String(e)}\n\`\`\``);
  }

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
  const missing = checkFilesExist(m as any);
  if (missing.length) {
    out.push(`\n**Missing public files detected:**\n- ${missing.join('\n- ')}`);
  }

  const dest = path.join(process.cwd(), 'content', 'ASSET_TODO.md');
  write(dest, out.join('\n'));
  console.log(`[assets] Wrote checklist → ${dest}`);
})();
