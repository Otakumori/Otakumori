import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(join(process.cwd(), 'app/styles/otakumori-uiux-overhaul.css'), 'utf8');
const layout = readFileSync(join(process.cwd(), 'app/layout.tsx'), 'utf8');
const fonts = readFileSync(join(process.cwd(), 'app/fonts.ts'), 'utf8');

describe('Otaku-mori UI/UX system contract', () => {
  it('loads the production display font and the final additive system layer', () => {
    expect(fonts).toContain('Marcellus_SC');
    expect(fonts).toContain("variable: '--font-marcellus-sc'");
    expect(layout).toContain("import './styles/otakumori-uiux-overhaul.css';");
    expect(layout).toContain('marcellusSc.variable');
  });

  it('keeps Home outside the interior visual-system selector and defines explicit containment', () => {
    expect(css).toContain(".om-site-interior-shell[data-mori-route-shell='interior']");
    expect(css).toContain('.om-surface--field');
    expect(css).toContain('.om-surface--material');
    expect(css).toContain('.om-surface--relic');
    expect(css).toContain('.om-surface--chamber');
  });

  it('documents border-to-fill controls and reduced-motion behavior', () => {
    expect(css).toContain('Border-to-fill controls');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('.om-games-selector__option');
    expect(css).toContain('.om-game-relic');
  });
});
