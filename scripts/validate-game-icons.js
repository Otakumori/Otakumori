#!/usr/bin/env node
// Validate canonical game cover assets.
// Usage:
//   node scripts/validate-game-icons.js

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const metaPath = path.resolve(__dirname, '..', 'lib', 'games.meta.json');
let gamesMeta = { games: [] };
try {
  gamesMeta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
} catch (e) {
  console.error('Failed to read games.meta.json at', metaPath, e.message);
  process.exit(1);
}
const games = Array.isArray(gamesMeta.games) ? gamesMeta.games : [];

const missing = [];
for (const game of games) {
  const image = typeof game.image === 'string' ? game.image : '';
  const filePath = path.resolve('public', `.${image}`);
  if (!image || !fs.existsSync(filePath)) missing.push(`${game.slug}: ${image || 'no image declared'}`);
}

if (missing.length === 0) {
  console.log('All canonical game cover assets are present.');
  process.exit(0);
}

console.log('Missing canonical game cover assets for:');
missing.forEach((m) => console.log(` - ${m}`));
