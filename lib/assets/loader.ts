import fs from 'node:fs';
import path from 'node:path';
import { OGSources, CategoryBanner } from '@/lib/assets/schema';

type Manifest = {
  og: any;
  categories: Record<string, { banner: any }>;
};

const ROOT = process.cwd();
const manifestPath = path.join(ROOT, 'content', 'assets.manifest.json');

export function loadManifest(): Manifest {
  const raw = fs.readFileSync(manifestPath, 'utf-8');
  return JSON.parse(raw);
}

export function validateManifest(manifest: Manifest) {
  OGSources.parse(manifest.og);
  for (const [, data] of Object.entries(manifest.categories ?? {})) {
    CategoryBanner.parse(data.banner);
  }
}

export function fileExistsInPublic(url: string) {
  if (!url?.startsWith('/')) return true; // external or bucket URLs assumed available at runtime
  const abs = path.join(ROOT, 'public', url.replace(/^\//, ''));
  return fs.existsSync(abs);
}

export function checkFilesExist(manifest: Manifest) {
  const missing: string[] = [];
  const probe = (url: string) => {
    if (url?.startsWith('/')) {
      const abs = path.join(ROOT, 'public', url.replace(/^\//, ''));
      if (!fs.existsSync(abs)) missing.push(url);
    }
  };
  if (manifest.og?.default) probe(manifest.og.default.url);
  if (manifest.og?.productTemplate) probe(manifest.og.productTemplate.url);
  for (const v of Object.values(manifest.categories ?? {})) probe(v.banner?.url);
  return missing;
}
