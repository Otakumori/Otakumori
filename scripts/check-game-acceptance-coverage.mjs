#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function evaluateCatalog(manifest, qaSource, routeExists) {
  const enabledGames = manifest.games.filter((game) => game.enabled === true);
  const enabledSlugs = enabledGames.map((game) => game.slug);
  const duplicateSlugs = enabledSlugs.filter((slug, index) => enabledSlugs.indexOf(slug) !== index);
  const enabledIds = enabledGames.map((game) => game.id);
  const duplicateIds = enabledIds.filter((id, index) => enabledIds.indexOf(id) !== index);
  const routesMissing = enabledSlugs.filter((slug) => !routeExists(slug));
  const qaUsesCanonicalManifest =
    qaSource.includes("from '../lib/games.meta.json'") &&
    /gamesMeta\.games\.filter\(.*enabled.*\)\.map\(.*slug.*\)/s.test(qaSource);
  const staleQaIdentifiers = ['bubble-girl'].filter((identifier) =>
    new RegExp(`['\"]${identifier}['\"]`).test(qaSource),
  );

  return {
    ok:
      duplicateSlugs.length === 0 &&
      duplicateIds.length === 0 &&
      routesMissing.length === 0 &&
      qaUsesCanonicalManifest &&
      staleQaIdentifiers.length === 0,
    enabledGames: enabledGames.map(({ id, slug, title, ageRating, nsfw }) => ({
      id,
      slug,
      title,
      mature: nsfw === true || ageRating === 'M',
    })),
    duplicateSlugs: [...new Set(duplicateSlugs)],
    duplicateIds: [...new Set(duplicateIds)],
    routesMissing,
    qaUsesCanonicalManifest,
    staleQaIdentifiers,
  };
}

export function inspectRepository(repoRoot) {
  const manifest = JSON.parse(readFileSync(join(repoRoot, 'lib/games.meta.json'), 'utf8'));
  const qaSource = readFileSync(join(repoRoot, 'scripts/qa-mini-games.ts'), 'utf8');
  const coverage = evaluateCatalog(manifest, qaSource, (slug) =>
    [
      join(repoRoot, 'app/mini-games', slug, 'page.tsx'),
      join(repoRoot, 'app/mini-games/(games)', slug, 'page.tsx'),
    ].some(existsSync),
  );
  const acceptancePath = join(repoRoot, 'docs/qa/game-beta-acceptance.json');
  const acceptance = JSON.parse(readFileSync(acceptancePath, 'utf8'));
  const requiredDimensions = acceptance.requiredDimensions;
  const recordsBySlug = new Map(acceptance.games.map((game) => [game.slug, game]));
  const missingAcceptanceGames = coverage.enabledGames
    .map((game) => game.slug)
    .filter((slug) => !recordsBySlug.has(slug));
  const staleAcceptanceGames = acceptance.games
    .map((game) => game.slug)
    .filter((slug) => !coverage.enabledGames.some((game) => game.slug === slug));
  const unverified = coverage.enabledGames.flatMap((game) => {
    const record = recordsBySlug.get(game.slug);
    return requiredDimensions
      .filter((dimension) => record?.dimensions?.[dimension]?.status !== 'PASS')
      .map((dimension) => ({ slug: game.slug, dimension }));
  });

  return {
    ...coverage,
    acceptance: {
      certified:
        missingAcceptanceGames.length === 0 &&
        staleAcceptanceGames.length === 0 &&
        unverified.length === 0,
      missingAcceptanceGames,
      staleAcceptanceGames,
      unverified,
    },
  };
}

export function resolveRepositoryRoot(args, currentFile) {
  const explicitRoot = args.find((argument) => !argument.startsWith('--'));
  return resolve(explicitRoot ?? join(dirname(currentFile), '..'));
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === resolve(currentFile)) {
  const repoRoot = resolveRepositoryRoot(process.argv.slice(2), currentFile);
  const report = inspectRepository(repoRoot);
  console.log(JSON.stringify(report, null, 2));
  const requireCertified = process.argv.includes('--require-certified');
  process.exitCode = report.ok && (!requireCertified || report.acceptance.certified) ? 0 : 1;
}
