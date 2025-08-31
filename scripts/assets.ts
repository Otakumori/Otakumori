/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
/* eslint-disable no-console */
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import AdmZip from 'adm-zip';

const ROOT = path.resolve(process.cwd());
const CONFIG_PATH = path.join(ROOT, 'app/lib/assets/assets.config.json');
const OUT_DIR = path.join(ROOT, 'app/lib/assets');
const PUBLIC_DIR = path.join(ROOT, 'public');
const MANIFEST_TS = path.join(OUT_DIR, 'manifest.ts');
const MANIFEST_D_TS = path.join(OUT_DIR, 'manifest.d.ts');

interface Config {
  version: number;
  baseDir: string;
  gamesDir?: string;
  items: Array<AssetConfigItem>;
}

interface AssetConfigItem {
  id: string;
  url?: string; // remote URL (optional if local file)
  file?: string; // local file path relative to /public (preferred) or repo root
  dest?: string;
  type?: string;
  license?: string;
  checksum?: string;
  extract?: boolean;
  flatten?: boolean;
  extractToGames?: boolean;
  gameSlug?: string;
}

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}
function extFromUrl(u: string) {
  try {
    const pathname = new URL(u).pathname;
    return path.extname(pathname) || '';
  } catch {
    return '';
  }
}
function guessTypeByExt(ext: string) {
  const e = ext.toLowerCase();
  if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif'].includes(e)) return 'image';
  if (['.mp3', '.wav', '.ogg', '.flac'].includes(e)) return 'audio';
  if (['.mp4', '.webm', '.mov'].includes(e)) return 'video';
  if (['.woff', '.woff2', '.ttf', '.otf', '.eot'].includes(e)) return 'font';
  if (['.zip'].includes(e)) return 'zip';
  return 'other';
}

async function sha256File(absPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const s = fs.createReadStream(absPath);
    s.on('error', reject);
    s.on('data', (d) => hash.update(d));
    s.on('end', () => resolve(hash.digest('hex')));
  });
}

async function downloadToTemp(url: string): Promise<{ tmpPath: string; bytes: number }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const arrayBuffer = await res.arrayBuffer();
  const buf = Buffer.from(arrayBuffer);
  const tmpPath = path.join(ROOT, '.tmp_asset_' + crypto.randomBytes(8).toString('hex'));
  await fsp.writeFile(tmpPath, buf);
  return { tmpPath, bytes: buf.length };
}

async function main() {
  ensureDir(OUT_DIR);
  ensureDir(PUBLIC_DIR);
  const raw = await fsp.readFile(CONFIG_PATH, 'utf8');
  const cfg = JSON.parse(raw) as Config;
  const baseDirAbs = path.join(ROOT, cfg.baseDir || 'public/assets');
  const gamesDirAbs = path.join(ROOT, cfg.gamesDir || 'public/games');
  ensureDir(baseDirAbs);
  ensureDir(gamesDirAbs);

  const manifest: Record<string, any> = {};

  for (const item of cfg.items) {
    const ext = extFromUrl(item.url || item.file || '') || '';
    const type = (item.type as any) || guessTypeByExt(ext);

    // --- NEW: local file handling (no download) ---
    if ((item.url == null || item.url === '') && item.file) {
      // If item.file starts with '/', treat as public-relative like 'assets/sfx/foo.wav';
      // otherwise, treat as repo-relative.
      const publicCandidate = path.join(PUBLIC_DIR, item.file);
      const abs = fs.existsSync(publicCandidate)
        ? publicCandidate
        : path.isAbsolute(item.file)
          ? item.file
          : path.join(ROOT, item.file);

      if (!fs.existsSync(abs)) {
        console.warn(`⚠ Skipping ${item.id}: local file not found -> ${abs}`);
        continue;
      }

      const bytes = fs.statSync(abs).size;
      // It's fine if local files aren't hashed; we record a hash for cache busting.
      const fileHash = await sha256File(abs);
      const publicPath = '/' + path.relative(PUBLIC_DIR, abs).replace(/\\/g, '/');

      manifest[item.id] = {
        id: item.id,
        type,
        src: publicPath,
        file: path.relative(ROOT, abs),
        license: item.license || undefined,
        bytes,
        sha256: fileHash,
      };
      console.log(`✓ Local file: ${item.id} -> ${publicPath}`);
      continue;
    }

    // --- existing ZIP handling stays as-is ---
    if (type === 'zip') {
      console.log(`→ Fetching ZIP ${item.id} from ${item.url}`);
      const { tmpPath, bytes } = await downloadToTemp(item.url!);
      const zip = new AdmZip(tmpPath);

      if (item.extractToGames) {
        const slug = item.gameSlug || item.id.split('.').slice(-1)[0];
        const destFolder = path.join(gamesDirAbs, slug);
        ensureDir(destFolder);
        zip.extractAllTo(destFolder, true);
        await fsp.unlink(tmpPath);
        const entryHtml = ['index.html', 'Index.html', 'INDEX.HTML'];
        let entry = '';
        for (const name of entryHtml) {
          const candidate = path.join(destFolder, name);
          if (fs.existsSync(candidate)) {
            entry = candidate;
            break;
          }
        }
        const publicEntry = entry
          ? '/' + path.relative(PUBLIC_DIR, entry).replace(/\\/g, '/')
          : '/games/' + slug + '/index.html';
        manifest[item.id] = {
          id: item.id,
          type: 'game',
          src: publicEntry,
          file: path.relative(ROOT, destFolder),
          license: item.license || undefined,
          bytes,
          sha256: '',
        };
        continue;
      }

      const destAbs = path.join(baseDirAbs, item.dest || '');
      ensureDir(destAbs);
      zip.getEntries().forEach((entry: any) => {
        if (entry.isDirectory) return;
        const rawName = path.basename(entry.entryName);
        const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, '-');
        const outPath = path.join(destAbs, safeName);
        ensureDir(path.dirname(outPath));
        fs.writeFileSync(outPath, entry.getData());
      });
      await fsp.unlink(tmpPath);
      const publicPath = '/' + path.relative(PUBLIC_DIR, destAbs).replace(/\\/g, '/');
      manifest[item.id] = {
        id: item.id,
        type: 'zip',
        src: publicPath,
        file: path.relative(ROOT, destAbs),
        license: item.license || undefined,
        bytes,
        sha256: '',
      };
      continue;
    }

    // --- existing non-zip download handling stays as-is ---
    if (!item.url) {
      console.warn(`⚠ Skipping ${item.id}: no URL and no local file`);
      continue;
    }

    // single file
    const destAbs = path.join(baseDirAbs, item.dest || '');
    ensureDir(destAbs);
    console.log(`→ Fetching ${item.id} from ${item.url}`);
    const { tmpPath, bytes } = await downloadToTemp(item.url);
    const actualHash = await sha256File(tmpPath);
    if (item.checksum && item.checksum.length > 0 && item.checksum.toLowerCase() !== actualHash) {
      await fsp.unlink(tmpPath);
      throw new Error(
        `Checksum mismatch for ${item.id}. Expected ${item.checksum}, got ${actualHash}`,
      );
    }
    const baseNameRaw = item.id.split('.').slice(-1)[0];
    const baseName = baseNameRaw.replace(/[^a-z0-9_-]/gi, '-');
    const cleanExt = ext || '.bin';
    const hashedName = `${baseName}.${actualHash.slice(0, 8)}${cleanExt}`;
    const finalAbs = path.join(destAbs, hashedName);
    await fsp.rename(tmpPath, finalAbs);
    const publicPath = '/' + path.relative(PUBLIC_DIR, finalAbs).replace(/\\/g, '/');
    manifest[item.id] = {
      id: item.id,
      type,
      src: publicPath,
      file: path.relative(ROOT, finalAbs),
      license: item.license || undefined,
      bytes,
      sha256: actualHash,
    };
  }

  const entries = Object.entries(manifest)
    .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
    .join('\n');
  const tsOut =
    `// AUTO‑GENERATED by scripts/assets.ts — do not edit by hand\n` +
    `import type { AssetMap, AssetLookup } from "./types";\n\n` +
    `export const ASSETS: AssetMap = {\n${entries}\n};\n\n` +
    `export const getAsset: AssetLookup = (function(){\n  const fn = ((id: string) => ASSETS[id]?.src ?? null) as AssetLookup;\n  fn.raw = ASSETS;\n  fn.has = (id: string) => !!ASSETS[id];\n  fn.info = (id: string) => ASSETS[id] ?? null;\n  return fn;\n})();\n\n` +
    `export const getGame = (slugOrId: string): string | null => {\n  const direct = ASSETS[slugOrId]?.src;\n  if (direct) return direct;\n  const found = Object.values(ASSETS).find(r => r.type === 'game' && (r as any).file.endsWith('/' + slugOrId));\n  return found ? (found as any).src : null;\n};\n`;

  await fsp.writeFile(MANIFEST_TS, tsOut, 'utf8');
  const keys = Object.keys(manifest)
    .map((k) => JSON.stringify(k))
    .join(' | ');
  const dts = `// AUTO‑GENERATED keys for getAsset()/getGame()\nexport type AssetId = ${keys || 'string'};\n`;
  await fsp.writeFile(MANIFEST_D_TS, dts, 'utf8');

  console.log(`\n✔ Done. ${Object.keys(manifest).length} items processed.`);
  console.log(`• Manifest: ${path.relative(ROOT, MANIFEST_TS)}`);
}

main().catch((err) => {
  console.error('✖ assets.ts failed:\n', err);
  process.exit(1);
});
