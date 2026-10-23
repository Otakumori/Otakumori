import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { validateRepositoryLinks } from '../../scripts/check-links.mjs';

const roots: string[] = [];

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), 'otm-links-'));
  roots.push(root);
  mkdirSync(path.join(root, 'app'), { recursive: true });
  mkdirSync(path.join(root, 'public', 'assets'), { recursive: true });
  return root;
}

afterEach(() => {
  while (roots.length) rmSync(roots.pop()!, { recursive: true, force: true });
});

describe('static launch link validation', () => {
  it('passes valid internal routes and public assets', () => {
    const root = fixture();
    mkdirSync(path.join(root, 'app', 'about'), { recursive: true });
    writeFileSync(
      path.join(root, 'app', 'page.tsx'),
      "export default () => <><a href='/about'>About</a><img src='/assets/logo.png' /></>",
    );
    writeFileSync(path.join(root, 'app', 'about', 'page.tsx'), 'export default () => null');
    writeFileSync(path.join(root, 'public', 'assets', 'logo.png'), 'image');

    expect(validateRepositoryLinks(root).failures).toEqual([]);
  });

  it('fails missing internal routes and static files', () => {
    const root = fixture();
    writeFileSync(
      path.join(root, 'app', 'page.tsx'),
      "export default () => <><a href='/missing'>Missing</a><img src='/assets/missing.png' /></>",
    );

    expect(validateRepositoryLinks(root).failures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: '/missing', reason: 'missing internal route' }),
        expect.objectContaining({ value: '/assets/missing.png', reason: 'missing public asset' }),
      ]),
    );
  });
});
