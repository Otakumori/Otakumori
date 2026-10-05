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

  it('makes Marcellus SC the visible first-party face for body, UI, and legacy sans utilities', () => {
    expect(css).toContain("--font-body: var(--font-marcellus-sc), 'Marcellus SC'");
    expect(css).toContain("--font-ui: var(--font-marcellus-sc), 'Marcellus SC'");
    expect(css).toContain('.font-sans { font-family: var(--font-ui); }');
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

  it('keeps Mini-Games selector text at the Lighthouse legibility floor', () => {
    expect(css).toContain('.om-games-selector__option-label { display: block; font-family: var(--font-ui); font-size: clamp(0.75rem, 1.1vw, 0.94rem);');
    expect(css).toContain('.om-games-selector__record-meta { color: var(--om-ivory-muted); font-family: var(--font-ui); font-size: 0.75rem;');
  });

  it('uses masked relative geometry and preserves that composition under reduced motion', () => {
    expect(css).toContain('masked relic procession, not a row');
    expect(css).toContain('--om-relic-x');
    expect(css).toContain('.om-games-selector__option.is-occluded { pointer-events: none; }');
    expect(css).toContain('.om-games-selector__rail:focus-visible { outline: 2px solid var(--om-focus);');
    expect(css).toContain('.om-games-selector__option { transition: none !important; }');
  });

  it('contains interaction experiments in the internal lab with a reduced-motion final state', () => {
    expect(css).toContain('.om-interaction-lab');
    expect(css).toContain('.om-interaction-lab *, .om-interaction-lab *::before, .om-interaction-lab *::after');
    expect(css).toContain('.om-lab-transition-stage__aperture { opacity: 0.82;');
  });
});
