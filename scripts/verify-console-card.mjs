#!/usr/bin/env node
// Verify critical Mini-Games Console artifacts exist before deploy.
// Fails with a clear message if something was overwritten by a merge.

import fs from 'node:fs';
import path from 'node:path';

function mustExist(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing required file: ${file}`);
  }
}

function mustContain(file, needles) {
  const text = fs.readFileSync(file, 'utf8');
  const missing = needles.filter((n) => !text.includes(n));
  if (missing.length) {
    const list = missing.map((m) => `  - ${m}`).join('\n');
    throw new Error(`File ${file} is missing required markers:\n${list}`);
  }
}

function mustParseJson(file, minLen = 1) {
  const raw = fs.readFileSync(file, 'utf8');
  let obj;
  try {
    obj = JSON.parse(raw);
  } catch (e) {
    throw new Error(`Invalid JSON in ${file}: ${e.message}`);
  }
  if (!Array.isArray(obj) || obj.length < minLen) {
    throw new Error(`Unexpected JSON in ${file}: expected array length >= ${minLen}`);
  }
}

try {
  const root = process.cwd();
  const consoleFile = path.join(root, 'app', 'mini-games', 'console', 'ConsoleCard.tsx');
  const metaFile = path.join(root, 'app', 'mini-games', 'games.meta.json');

  mustExist(consoleFile);
  mustExist(metaFile);

  // Core imports / features must be present in ConsoleCard
  mustContain(consoleFile, [
    "import gamesMeta from '../games.meta.json'",
    'function GameViewport',
    'AchievementsPreview',
    'function GameIcon',
  ]);

  // Ensure key games remain mapped
  mustContain(consoleFile, [
    "'petal-collection'",
    "'memory-match'",
    "'rhythm-beat-em-up'",
    "'bubble-girl'",
    "'petal-storm-rhythm'",
    "'bubble-ragdoll'",
    "'samurai-petal-slice'",
    "'blossomware'",
    "'dungeon-of-desire'",
    "'maid-cafe-manager'",
    "'thigh-coliseum'",
    "'quick-math'",
    "'puzzle-reveal'",
    "'petal-samurai'",
  ]);

  // Metadata must be present and have at least 10 entries
  mustParseJson(metaFile, 10);

  console.log('verify-console-card: OK');
} catch (err) {
  console.error('verify-console-card: FAIL');
  console.error(String(err.message || err));
  process.exit(1);
}
