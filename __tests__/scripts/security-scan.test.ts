import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { hasBlockingFindings, scanText, scanTrackedFiles } from '@/scripts/security-scan';

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

function tempFile(name: string, content: string) {
  const dir = mkdtempSync(path.join(tmpdir(), 'otm-secret-scan-'));
  tempDirs.push(dir);
  const filePath = path.join(dir, name);
  writeFileSync(filePath, content);
  return filePath;
}

describe('tracked secret scanner', () => {
  it('detects a synthetic credential literal without emitting the literal', () => {
    const synthetic = 'sk_test_1234567890abcdef1234567890abcdef';
    const findings = scanText(`STRIPE_SECRET_KEY=${synthetic}`, 'docs/example.md');

    expect(hasBlockingFindings(findings)).toBe(true);
    expect(findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'docs/example.md',
          line: 1,
          classification: 'confirmed-or-probable-credential',
          value: 'REDACTED',
        }),
      ]),
    );
    expect(JSON.stringify(findings)).not.toContain(synthetic);
  });

  it('allows placeholders and process.env references', () => {
    const findings = scanText(
      [
        'SANITY_WEBHOOK_SECRET=<set-in-provider>',
        'const eventKey = process.env.INNGEST_EVENT_KEY;',
        'DATABASE_URL=postgresql://user:password@localhost/app',
      ].join('\n'),
      'env.example',
    );

    expect(hasBlockingFindings(findings)).toBe(false);
  });

  it('blocks tracked non-template environment artifacts without printing contents', () => {
    const findings = scanText('SANITY_WEBHOOK_SECRET=<redacted>', '.env.production');

    expect(findings).toContainEqual({
      path: '.env.production',
      line: 0,
      ruleId: 'tracked_env_artifact',
      classification: 'tracked-secret-artifact',
      value: 'REDACTED',
    });
    expect(hasBlockingFindings(findings)).toBe(true);
    expect(JSON.stringify(findings)).not.toContain('<redacted>');
  });

  it('scans explicit files and never returns matched values', () => {
    const synthetic = 'whsec_1234567890abcdef1234567890abcdef';
    const filePath = tempFile('fixture.md', `STRIPE_WEBHOOK_SECRET=${synthetic}`);
    const findings = scanTrackedFiles([filePath]);

    expect(hasBlockingFindings(findings)).toBe(true);
    expect(JSON.stringify(findings)).not.toContain(synthetic);
  });
});
