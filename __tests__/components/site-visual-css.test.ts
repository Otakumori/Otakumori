import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const globalsCss = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');
const foundationCss = readFileSync(join(process.cwd(), 'app/styles/mori-foundation.css'), 'utf8');
const rootLayout = readFileSync(join(process.cwd(), 'app/layout.tsx'), 'utf8');

describe('site visual CSS contract', () => {
  it('defines semantic typography roles and applies the shared visual shell', () => {
    expect(globalsCss).toContain('--font-display');
    expect(globalsCss).toContain('--font-body');
    expect(globalsCss).toContain('--font-ui');
    expect(globalsCss).toContain('.om-site-interior-shell');
    expect(globalsCss).toContain("svg:not([data-preserve-icon])");
    expect(rootLayout).toContain('<SiteVisualShell>{children}</SiteVisualShell>');
    expect(rootLayout).toContain('className="font-body"');
  });

  it('loads the incremental semantic Mori foundation after legacy global CSS', () => {
    expect(rootLayout).toContain("import './styles/mori-foundation.css';");
    expect(foundationCss).toContain('--mori-surface-parchment');
    expect(foundationCss).toContain('--mori-world-echo-warmth');
    expect(foundationCss).toContain('.mori-foundation-button:focus-visible');
    expect(foundationCss).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
