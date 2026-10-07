#!/usr/bin/env node

import { cp, mkdir, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const threeEntry = require.resolve('three');
const threeRoot = path.resolve(path.dirname(threeEntry), '..');
const source = path.join(threeRoot, 'examples', 'jsm', 'libs', 'basis');
const destination = path.resolve(
  process.cwd(),
  'public',
  'avatar',
  'transcoders',
  'basis',
);

await rm(destination, { recursive: true, force: true });
await mkdir(path.dirname(destination), { recursive: true });
await cp(source, destination, { recursive: true });

console.log(
  `Synced Three.js Basis transcoder from ${source} to ${destination}`,
);
