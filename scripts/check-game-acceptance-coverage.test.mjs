import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateCatalog } from './check-game-acceptance-coverage.mjs';

const manifest = {
  games: [
    { id: 'bubble-ragdoll', slug: 'bubble-ragdoll', title: 'Bubble Ragdoll', enabled: true },
    {
      id: 'maid-cafe-manager',
      slug: 'maid-cafe-manager',
      title: 'Maid Cafe Manager',
      enabled: true,
    },
    { id: 'hidden', slug: 'hidden', title: 'Hidden', enabled: false },
  ],
};

const canonicalQaSource = `
  import gamesMeta from '../lib/games.meta.json';
  const GAMES = gamesMeta.games.filter((game) => game.enabled).map((game) => game.slug);
`;

test('passes when enabled manifest games have routes and drive QA directly', () => {
  const report = evaluateCatalog(manifest, canonicalQaSource, () => true);
  assert.equal(report.ok, true);
  assert.deepEqual(
    report.enabledGames.map((game) => game.slug),
    ['bubble-ragdoll', 'maid-cafe-manager'],
  );
});

test('fails for missing routes, duplicate identities, and stale QA identifiers', () => {
  const report = evaluateCatalog(
    {
      games: [
        ...manifest.games,
        { id: 'bubble-ragdoll', slug: 'bubble-ragdoll', title: 'Duplicate', enabled: true },
      ],
    },
    "const GAMES = ['bubble-girl'];",
    (slug) => slug !== 'maid-cafe-manager',
  );

  assert.equal(report.ok, false);
  assert.deepEqual(report.duplicateIds, ['bubble-ragdoll']);
  assert.deepEqual(report.duplicateSlugs, ['bubble-ragdoll']);
  assert.deepEqual(report.routesMissing, ['maid-cafe-manager']);
  assert.deepEqual(report.staleQaIdentifiers, ['bubble-girl']);
  assert.equal(report.qaUsesCanonicalManifest, false);
});
