import { existsSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { validateDocumentationRegistry } from '@/scripts/docs-security-check';

const DOC_PATH = 'docs/design/mori-visual-system.md';
const REGISTRY_PATH = 'docs/documentation-registry.json';
const TRUTH_INDEX_PATH = 'docs/repository-documentation.md';

function readText(path: string) {
  return readFileSync(path, 'utf8');
}

function readRegistry() {
  return JSON.parse(readText(REGISTRY_PATH)) as {
    documents: Array<{
      path: string;
      status: string;
      domain: string;
      owner: string;
      lastVerifiedCommit?: string;
      warning?: string;
    }>;
  };
}

describe('Mori visual system documentation contract', () => {
  it('registers the Mori visual system as the canonical visual-design source', () => {
    expect(existsSync(DOC_PATH)).toBe(true);
    expect(validateDocumentationRegistry()).toEqual([]);

    const registry = readRegistry();
    const visualEntry = registry.documents.find((document) => document.path === DOC_PATH);

    expect(visualEntry).toEqual(
      expect.objectContaining({
        domain: 'visual-design',
        owner: 'visual-system',
        path: DOC_PATH,
        status: 'canonical',
      }),
    );
    expect(visualEntry?.lastVerifiedCommit).toBeUndefined();
    expect(visualEntry?.warning).toContain('does not authorize');
    expect(readText(TRUTH_INDEX_PATH)).toContain(DOC_PATH);
  });

  it('captures the required design, commerce, accessibility, and PetalWallet-safe rules', () => {
    const doc = readText(DOC_PATH);

    for (const phrase of [
      'dark sakura storybook marketplace',
      'Commerce clarity, accessibility, accurate product presentation, and trust',
      'Product photography remains accurate, large, and unobstructed',
      'keyboard focus visible',
      'reduced-motion behavior',
      'Petal UI is visual-only unless the server-owned PetalWallet path is verified',
      'Draft PR #40',
      'stale reference material',
      'Tier 8',
    ]) {
      expect(doc).toContain(phrase);
    }

    expect(doc).toMatch(/Checkout should look\s+trusted and quiet\./);
    expect(doc).toMatch(/screenshot or video evidence/i);
    expect(doc).not.toContain('safe to import');
    expect(doc).toContain('This document does not authorize provider writes');
  });
});
