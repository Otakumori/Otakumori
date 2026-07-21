import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  hasBlockingFindings,
  scanDocumentationText,
  validateDocumentationRegistry,
} from '@/scripts/docs-security-check';

const CLI_COMMAND = process.platform === 'win32' ? 'corepack.cmd' : 'corepack';
const CLI_ARGS = ['pnpm', 'exec', 'tsx', 'scripts/docs-security-check.ts'];

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
      'DATABASE_URL=postgresql://otaku_owner:superSecretValue123@db.neon.example.net/neondb',
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
    expect(JSON.stringify(findings)).not.toContain('fingerprint');
    expect(JSON.stringify(findings)).not.toContain('sk_test_1234567890abcdef1234567890abcdef');
    expect(JSON.stringify(findings)).not.toContain('superSecretValue123');
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

  it('does not downgrade valid-looking candidates because surrounding prose says example, test, or fake', () => {
    const text = [
      'Example: STRIPE_SECRET_KEY=sk_test_1234567890abcdef1234567890abcdef',
      'Test credential: STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef1234567890abcdef',
      'Fake production URL: DATABASE_URL=postgresql://otaku_owner:superSecretValue123@db.neon.example.net/neondb',
    ].join('\n');

    const findings = scanDocumentationText(text, 'docs/adversarial.md');

    expect(hasBlockingFindings(findings)).toBe(true);
    expect(findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          classification: 'confirmed-or-probable-credential',
          ruleId: 'stripe_or_clerk_secret_key',
        }),
        expect.objectContaining({
          classification: 'confirmed-or-probable-credential',
          ruleId: 'stripe_webhook_secret',
        }),
        expect.objectContaining({
          classification: 'confirmed-or-probable-credential',
          ruleId: 'postgres_connection_url',
        }),
      ]),
    );
    const serialized = JSON.stringify(findings);
    expect(serialized).not.toContain('sk_test_1234567890abcdef1234567890abcdef');
    expect(serialized).not.toContain('whsec_1234567890abcdef1234567890abcdef');
    expect(serialized).not.toContain('superSecretValue123');
  });

  it('does not accept production-looking PostgreSQL URLs because one credential component is generic', () => {
    const cases = [
      {
        password: 'realLookingPassword12345',
        text: 'DATABASE_URL=postgresql://postgres:realLookingPassword12345@db.provider.example.net/app',
      },
      {
        password: 'anotherRealLookingPassword12345',
        text: 'DATABASE_URL=postgresql://user:anotherRealLookingPassword12345@db.provider.example.net/app',
      },
      {
        password: 'companyPassword12345',
        text: 'DATABASE_URL=postgresql://username:companyPassword12345@database.company.test/app',
      },
    ];

    for (const { password, text } of cases) {
      const findings = scanDocumentationText(text, 'docs/postgres.md');
      expect(hasBlockingFindings(findings)).toBe(true);
      expect(findings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            classification: 'confirmed-or-probable-credential',
            ruleId: 'postgres_connection_url',
          }),
        ]),
      );
      const serialized = JSON.stringify(findings);
      expect(serialized).not.toContain(password);
      expect(serialized).not.toContain(text.split('=')[1]);
    }
  });

  it('accepts structurally reserved PostgreSQL placeholder URLs', () => {
    const findings = scanDocumentationText(
      [
        'DATABASE_URL=postgresql://user:password@example.invalid/app',
        'DATABASE_URL=postgresql://postgres:password@localhost/app',
      ].join('\n'),
      'docs/postgres-placeholders.md',
    );

    expect(hasBlockingFindings(findings)).toBe(false);
    expect(findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          classification: 'example-placeholder',
          ruleId: 'postgres_connection_url',
        }),
      ]),
    );
  });

  it('does not let a same-location finding id authorize a changed credential', () => {
    const placeholder = scanDocumentationText(
      'DATABASE_URL=postgresql://user:password@example.invalid/app',
      'docs/same-location.md',
    );
    const changedCredential = scanDocumentationText(
      'DATABASE_URL=postgresql://user:realLookingPassword12345@db.provider.example.net/app',
      'docs/same-location.md',
    );

    expect(placeholder.map((finding) => finding.findingId)).toEqual(
      changedCredential.map((finding) => finding.findingId),
    );
    expect(hasBlockingFindings(placeholder)).toBe(false);
    expect(hasBlockingFindings(changedCredential)).toBe(true);
    expect(changedCredential).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          classification: 'confirmed-or-probable-credential',
          ruleId: 'postgres_connection_url',
        }),
      ]),
    );
    const serialized = JSON.stringify(changedCredential);
    expect(serialized).not.toContain('realLookingPassword12345');
    expect(serialized).not.toContain('db.provider.example.net');
  });

  it('uses non-secret-derived finding ids', () => {
    const first = scanDocumentationText(
      'STRIPE_SECRET_KEY=sk_test_1234567890abcdef1234567890abcdef',
      'docs/example.md',
    );
    const changedValue = scanDocumentationText(
      'STRIPE_SECRET_KEY=sk_test_fedcba0987654321fedcba0987654321',
      'docs/example.md',
    );
    const moved = scanDocumentationText(
      ['# heading', 'STRIPE_SECRET_KEY=sk_test_1234567890abcdef1234567890abcdef'].join('\n'),
      'docs/example.md',
    );

    expect(first.map((finding) => finding.findingId)).toEqual(
      changedValue.map((finding) => finding.findingId),
    );
    expect(first.map((finding) => finding.findingId)).not.toEqual(
      moved.map((finding) => finding.findingId),
    );
    expect(JSON.stringify(first)).not.toContain('fingerprint');
    expect(JSON.stringify(first)).not.toContain('sk_test_1234567890abcdef1234567890abcdef');
  });

  it('executes the real CLI in check mode and fails closed on a blocking fixture without raw output', () => {
    const cleanOutput = execFileSync(CLI_COMMAND, [...CLI_ARGS, '--check'], {
      encoding: 'utf8',
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 30_000,
    });

    expect(cleanOutput).toContain('Documentation secret-safety check passed:');
    expect(cleanOutput).toContain('candidates detected');
    expect(cleanOutput).toContain('blocking');
    expect(cleanOutput).toContain('require review');

    const dir = makeTempDir();
    const fixturePath = path.join(dir, 'blocking.md');
    const fabricatedSecret = 'sk_test_1234567890abcdef1234567890abcdef';
    writeFileSync(fixturePath, `Example: STRIPE_SECRET_KEY=${fabricatedSecret}\n`);

    let combinedOutput = '';
    let exitCode = 0;
    try {
      execFileSync(CLI_COMMAND, [...CLI_ARGS, '--check', '--file', fixturePath], {
        encoding: 'utf8',
        shell: process.platform === 'win32',
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 30_000,
      });
    } catch (error) {
      const commandError = error as { status?: number; stdout?: string; stderr?: string };
      exitCode = commandError.status ?? 1;
      combinedOutput = `${commandError.stdout ?? ''}${commandError.stderr ?? ''}`;
    }

    expect(exitCode).not.toBe(0);
    expect(combinedOutput).toContain('Documentation secret-safety check failed:');
    expect(combinedOutput).toContain('2 blocking');
    expect(combinedOutput).not.toContain(fabricatedSecret);
  }, 35_000);
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
        sourceBaselineCommit: 'abc',
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
        sourceBaselineCommit: 'abc',
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

    const registry = JSON.parse(readFileSync('docs/documentation-registry.json', 'utf8')) as {
      lastReviewedCommit?: string;
      sourceBaselineCommit?: string;
      documents: Array<{ path: string; lastVerifiedCommit?: string }>;
    };
    expect(registry.sourceBaselineCommit).toBe('4e3cdcd43ea10a21ce306e40fdc7ededa6380f0d');
    expect(registry.lastReviewedCommit).toBeUndefined();
    expect(
      registry.documents.find((doc) => doc.path === 'docs/repository-documentation.md')
        ?.lastVerifiedCommit,
    ).toBeUndefined();
    expect(
      registry.documents.find((doc) => doc.path === 'docs/documentation-registry.json')
        ?.lastVerifiedCommit,
    ).toBeUndefined();
  });
});
