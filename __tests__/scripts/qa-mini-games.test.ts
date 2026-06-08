import { describe, expect, it } from 'vitest';
import { join } from 'node:path';
import { resolveGamePath } from '@/scripts/qa-mini-games';

describe('mini-game QA route discovery', () => {
  it('resolves game pages inside the App Router route group', () => {
    expect(resolveGamePath('petal-samurai')).toBe(
      join(process.cwd(), 'app', 'mini-games', '(games)', 'petal-samurai', 'page.tsx'),
    );
  });
});
