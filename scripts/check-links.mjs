#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);
const PAGE_PATTERN = /^page\.(?:ts|tsx|js|jsx)$/;
const IGNORED_PARTS = new Set(['node_modules', '.next', '.git', '__tests__', 'fixtures']);
const STATIC_FILE_PATTERN =
  /\.(?:avif|css|gif|ico|jpe?g|json|mp3|mp4|ogg|png|svg|webm|webp|woff2?)$/i;

function walk(directory, predicate, results = []) {
  if (!existsSync(directory)) return results;
  for (const entry of readdirSync(directory)) {
    if (IGNORED_PARTS.has(entry)) continue;
    const absolute = path.join(directory, entry);
    const stat = statSync(absolute);
    if (stat.isDirectory()) walk(absolute, predicate, results);
    else if (predicate(absolute)) results.push(absolute);
  }
  return results;
}

function routePatternFromPage(appRoot, pageFile) {
  const relative = path.relative(appRoot, path.dirname(pageFile)).replaceAll('\\', '/');
  const segments = relative
    .split('/')
    .filter(Boolean)
    .filter((segment) => !segment.startsWith('(') && !segment.startsWith('@'));

  const source =
    '/' +
    segments
      .map((segment) => {
        if (/^\[\[\.\.\..+\]\]$/.test(segment)) return '(?:.+)?';
        if (/^\[\.\.\..+\]$/.test(segment)) return '.+';
        if (/^\[.+\]$/.test(segment)) return '[^/]+';
        return segment.replace(/[.*+?^$()|[\]\\]/g, '\\\\$&');
      })
      .join('/');

  return new RegExp(`^${source === '/' ? '/' : source.replace(/\/$/, '')}/?$`);
}

export function collectRoutePatterns(root) {
  const appRoot = path.join(root, 'app');
  return walk(appRoot, (file) => PAGE_PATTERN.test(path.basename(file))).map((file) => ({
    file,
    pattern: routePatternFromPage(appRoot, file),
  }));
}

export function collectReferences(root) {
  const appRoot = path.join(root, 'app');
  const candidates = walk(appRoot, (file) => {
    const extension = path.extname(file);
    return SOURCE_EXTENSIONS.has(extension) && !/\.(?:old|safe)\.[^.]+$/.test(file);
  });
  const candidateSet = new Set(candidates.map((file) => path.normalize(file)));
  const sourceFiles = [];
  const pending = candidates.filter((file) => /(?:page|layout)\.(?:ts|tsx|js|jsx)$/.test(file));
  const visited = new Set();

  function resolveImport(fromFile, specifier) {
    if (!specifier.startsWith('.') && !specifier.startsWith('@/')) return null;
    const base = specifier.startsWith('@/')
      ? path.join(root, specifier.slice(2))
      : path.resolve(path.dirname(fromFile), specifier);
    const options = [
      base,
      ...[...SOURCE_EXTENSIONS].map((extension) => base + extension),
      ...[...SOURCE_EXTENSIONS].map((extension) => path.join(base, 'index' + extension)),
    ];
    return (
      options.map((file) => path.normalize(file)).find((file) => candidateSet.has(file)) ?? null
    );
  }

  while (pending.length > 0) {
    const file = pending.pop();
    if (!file || visited.has(file)) continue;
    visited.add(file);
    sourceFiles.push(file);
    const source = readFileSync(file, 'utf8');
    const importPattern = /(?:from\s+|import\s*\()\s*['"]([^'"]+)['"]/g;
    for (const match of source.matchAll(importPattern)) {
      const imported = resolveImport(file, match[1]);
      if (imported && !visited.has(imported)) pending.push(imported);
    }
  }

  const links = [];
  const assets = [];
  const linkPattern =
    /(?:href\s*=|router\.(?:push|replace)\s*\(|location\.assign\s*\()\s*(?:\{\s*)?['"\x60](\/[^'"\x60?#]*)/g;
  const assetPattern =
    /(?:src|poster)\s*=\s*(?:\{\s*)?['"](\/[^'"]+\.(?:avif|gif|ico|jpe?g|mp3|mp4|ogg|png|svg|webm|webp|woff2?))['"]/gi;

  for (const file of sourceFiles) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(linkPattern)) links.push({ file, value: match[1] });
    for (const match of source.matchAll(assetPattern)) assets.push({ file, value: match[1] });
  }

  return { links, assets };
}

export function validateRepositoryLinks(root) {
  const routes = collectRoutePatterns(root);
  const { links, assets } = collectReferences(root);
  const failures = [];
  const unverifiable = [];

  for (const reference of links) {
    const target = reference.value.replace(/\/$/, '') || '/';
    if (target.startsWith('/api/') || target.startsWith('/_next/')) continue;
    if (STATIC_FILE_PATTERN.test(target)) continue;

    if (target.includes('[') || target.includes('\${')) {
      unverifiable.push({ ...reference, reason: 'dynamic target' });
      continue;
    }

    if (!routes.some(({ pattern }) => pattern.test(target))) {
      failures.push({ ...reference, reason: 'missing internal route' });
    }
  }

  for (const reference of assets) {
    const relative = decodeURIComponent(reference.value).replace(/^\//, '');
    if (!existsSync(path.join(root, 'public', relative))) {
      failures.push({ ...reference, reason: 'missing public asset' });
    }
  }

  return { failures, unverifiable, checked: links.length + assets.length };
}

function formatReference(root, item) {
  return `${path.relative(root, item.file)} -> ${item.value} (${item.reason})`;
}

export function run(root) {
  const result = validateRepositoryLinks(root);
  for (const item of result.unverifiable)
    console.warn(`UNVERIFIED: ${formatReference(root, item)}`);
  for (const item of result.failures) console.error(`BROKEN: ${formatReference(root, item)}`);

  console.log(
    `Link check: ${result.checked} literal references, ${result.failures.length} broken, ${result.unverifiable.length} unverifiable.`,
  );
  return result.failures.length === 0 ? 0 : 1;
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  const rootArgument = process.argv.indexOf('--root');
  const root = rootArgument >= 0 ? path.resolve(process.argv[rootArgument + 1]) : process.cwd();
  process.exitCode = run(root);
}
