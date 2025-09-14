#!/usr/bin/env node
// Validate presence of game icon assets and optionally generate monochrome placeholders.
// Usage:
//   node scripts/validate-game-icons.js           # report only
//   node scripts/validate-game-icons.js --generate  # generate simple placeholders for missing

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const metaPath = path.resolve(__dirname, '..', 'app', 'mini-games', 'games.meta.json');
let gamesMeta = [];
try {
  gamesMeta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
} catch (e) {
  console.error('Failed to read games.meta.json at', metaPath, e.message);
  process.exit(1);
}
const games = gamesMeta.map((g) => g.slug);

const exts = ['.svg', '.png', '.jpg'];
const assetsDir = path.resolve('public', 'assets', 'games');
const generate = process.argv.includes('--generate');

if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

function hasIcon(slug) {
  return exts.some((ext) => fs.existsSync(path.join(assetsDir, `${slug}${ext}`)));
}

function abbr(slug) {
  // Take first letters of meaningful parts
  const parts = slug.split('-').filter(Boolean);
  const letters = parts.map((p) => p[0]).join('').toUpperCase();
  return letters.slice(0, 2) || slug[0].toUpperCase();
}

function placeholderSVG(letter) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">\n` +
    `  <rect x="8" y="8" width="80" height="80" rx="16" fill="#111317" stroke="#e3e3e3" stroke-width="2"/>\n` +
    `  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"` +
    `    font-family="Inter,Segoe UI,Arial,sans-serif" font-size="42" fill="#e3e3e3">${letter}</text>\n` +
    `</svg>\n`;
}

const missing = [];
for (const slug of games) {
  if (!hasIcon(slug)) missing.push(slug);
}

if (missing.length === 0) {
  console.log('All game icons present.');
  process.exit(0);
}

console.log('Missing icons for:');
missing.forEach((m) => console.log(` - ${m}`));

if (generate) {
  console.log('\nGenerating monochrome placeholders...');
  for (const slug of missing) {
    const file = path.join(assetsDir, `${slug}.svg`);
    fs.writeFileSync(file, placeholderSVG(abbr(slug)), 'utf8');
    console.log(` + ${path.relative(process.cwd(), file)}`);
  }
  console.log('\nDone. Replace these with final SVGs when ready.');
}
