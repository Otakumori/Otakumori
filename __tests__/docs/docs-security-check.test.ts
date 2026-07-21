import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  hasBlockingFindings,
  scanDocumentationText,
  validateDocumentationRegistry,
} from '@/scripts/docs-security-check';

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

function makeTempDir() {
  const dir = mkdtempSync(path.join(tmpdir(), 'otm-doc-safety-'));
  tempDirs.push(dir);
  return dir;
}

describe('documentation secret-safety scanner', () => {
  it('detects high-confidence fake token, database URL, and webhook-secret patterns without returning raw values', () => {
    const text = [
      'STRIPE_SECRET_KEY=sk_test_1234567890abcdef1234567890abcdef',
      'DATABASE_URL=postgresql://fakeuser:fakepass@example.invalid/neondb',
      'STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef1234567890abcdef',
    ].join('\n');

    const findings = scanDocumentationText(text, 'docs\\example.md');

    expect(findings.map((finding) => finding.ruleId)).toEqual([
      'secret_env_assignment',
      'stripe_or_clerk_secret_key',
      'postgres_connection_url',
      'secret_env_assignment',
      'secret_env_assignment',
      'stripe_webhook_secret',
    ]);
    expect(
      findings.some((finding) => finding.classification === 'confirmed-or-probable-credential'),
    ).toBe(true);
    expect(JSON.stringify(findings)).not.toContain('sk_test_1234567890abcdef1234567890abcdef');
    expect(JSON.stringify(findings)).not.toContain('fakeuser:fakepass');
    expect(JSON.stringify(findings)).not.toContain('whsec_1234567890abcdef1234567890abcdef');
  });

  it('accepts placeholders, environment variable names, and redacted values', () => {
    const text = [
      'STRIPE_SECRET_KEY=<YOUR_STRIPE_SECRET_KEY>',
      'DATABASE_URL=<DATABASE_URL>',
      'Authorization: Bearer <YOUR_TOKEN>',
      'CLERK_SECRET_KEY=<REDACTED>',
      'Use env.CLERK_SECRET_KEY as the server-side variable name.',
    ].join('\n');

    const findings = scanDocumentationText(text, 'docs/placeholders.md');

    expect(findings).toHaveLength(0);
    expect(hasBlockingFindings(findings)).toBe(false);
  });

  it('normalizes Windows paths and sorts findings deterministically', () => {
    const text = [
      'STRIPE_WEBHOOK_SECRET=whsec_abcdefabcdefabcdefabcdefabcdef',
      'DATABASE_URL=postgresql://user:pass@example.invalid/db',
    ].join('\n');

    const findings = scanDocumentationText(text, 'guides\\nested\\setup.md');

    expect(findings.map((finding) => finding.path)).toEqual([
      'guides/nested/setup.md',
      'guides/nested/setup.md',
      'guides/nested/setup.md',
      'guides/nested/setup.md',
    ]);
    expect(findings.map((finding) => `${finding.line}:${finding.ruleId}`)).toEqual([
      '1:secret_env_assignment',
      '1:stripe_webhook_secret',
      '2:postgres_connection_url',
      '2:secret_env_assignment',
    ]);
  });
});

describe('documentation registry validation', () => {
  it('fails duplicate document entries', () => {
    const dir = makeTempDir();
    writeFileSync(path.join(dir, 'doc.md'), '# Doc\n');
    const registry = path.join(dir, 'registry.json');
    writeFileSync(
      registry,
      JSON.stringify({
        version: 1,
        lastReviewedDate: '2026-07-21',
        lastReviewedCommit: 'abc',
        documents: [
          {
            path: path.join(dir, 'doc.md'),
            domain: 'test',
            status: 'canonical',
            owner: 'test',
            maintenance: 'manual',
          },
          {
            path: path.join(dir, 'doc.md'),
            domain: 'test',
            status: 'current-reference',
            owner: 'test',
            maintenance: 'manual',
          },
        ],
      }),
    );

    expect(validateDocumentationRegistry(registry)).toContainEqual(
      expect.stringContaining('duplicate document entry'),
    );
  });

  it('fails missing superseding targets', () => {
    const dir = makeTempDir();
    writeFileSync(path.join(dir, 'doc.md'), '# Doc\n');
    const registry = path.join(dir, 'registry.json');
    writeFileSync(
      registry,
      JSON.stringify({
        version: 1,
        lastReviewedDate: '2026-07-21',
        lastReviewedCommit: 'abc',
        documents: [
          {
            path: path.join(dir, 'doc.md'),
            domain: 'test',
            status: 'stale',
            owner: 'test',
            supersededBy: path.join(dir, 'missing.md'),
            maintenance: 'manual',
          },
        ],
      }),
    );

    expect(validateDocumentationRegistry(registry)).toContainEqual(
      expect.stringContaining('superseding target'),
    );
  });

  it('passes the checked-in registry', () => {
    expect(validateDocumentationRegistry()).toEqual([]);
  });
});
