import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const globalsCss = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');
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
});
