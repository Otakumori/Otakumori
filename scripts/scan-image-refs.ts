/**
 * Scans source files for image references so we don't miss assets.
 * Finds:
 *  - <Image src="/..."> and <img src="/...">
 *  - strings like "/banners/...png|jpg|webp"
 *  - OG imports like default-og.png
 */
import fs from 'node:fs';
import path from 'node:path';

const exts = ['.tsx', '.ts', '.jsx', '.js', '.mdx'];
const root = process.cwd();
const srcDirs = ['app', 'components', 'lib', 'content'];

const results = new Map<string, string[]>(); // path -> matches

function walk(dir: string) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) {
      walk(p);
    } else if (exts.includes(path.extname(p))) {
      const text = fs.readFileSync(p, 'utf-8');
      const matches = new Set<string>();
      // next/image or img tags
      const re1 = /(?:src\s*=\s*["'`](\/[^"'`]+?\.(?:png|jpe?g|webp|gif|svg))["'`])/g;
      // hard-coded public refs
      const re2 =
        /(\/(?:og|brand|banners|categories|products)\/[^"'`)\s]+?\.(?:png|jpe?g|webp|gif|svg))/g;
      let m;
      while ((m = re1.exec(text))) matches.add(m[1]);
      while ((m = re2.exec(text))) matches.add(m[1]);
      if (matches.size) results.set(p, Array.from(matches.values()));
    }
  }
}

for (const d of srcDirs) {
  const abs = path.join(root, d);
  if (fs.existsSync(abs)) walk(abs);
}

const lines: string[] = [];
lines.push('# IMAGE REF SCAN (auto-generated)\n');
lines.push(
  'These are image paths referenced in code/markdown. Ensure files exist in `public/` or via remote loaders.\n',
);
for (const [file, paths] of results.entries()) {
  lines.push(`\n## ${path.relative(root, file)}`);
  for (const p of paths) lines.push(`- ${p}`);
}
const out = path.join(root, 'content', 'IMAGE_REF_SCAN.md');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, lines.join('\n'), 'utf-8');
console.log(`[scan] Wrote → ${out}`);
