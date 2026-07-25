import { existsSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { validateDocumentationRegistry } from '@/scripts/docs-security-check';

type Registry = {
  lastReviewedDate: string;
  sourceBaselineCommit: string;
  documents: Array<{
    path: string;
    status: string;
    domain: string;
    owner: string;
    lastVerifiedCommit?: string;
  }>;
};

const AGENTS_PATH = 'AGENTS.md';
const VALIDATION_PATH = 'docs/repository-validation.md';
const REGISTRY_PATH = 'docs/documentation-registry.json';
const TRUTH_INDEX_PATH = 'docs/repository-documentation.md';

function readText(path: string) {
  return readFileSync(path, 'utf8');
}

function readRegistry(): Registry {
  return JSON.parse(readText(REGISTRY_PATH)) as Registry;
}

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readText('package.json')) as { scripts: Record<string, string> };
  return pkg.scripts;
}

function section(text: string, heading: string) {
  const start = text.indexOf(heading);
  expect(start).toBeGreaterThanOrEqual(0);
  const rest = text.slice(start + heading.length);
  const nextHeading = rest.search(/\n## /);
  return nextHeading === -1 ? rest : rest.slice(0, nextHeading);
}

describe('repository operating contract', () => {
  it('registers the root contract and validation hierarchy as canonical documents', () => {
    expect(existsSync(AGENTS_PATH)).toBe(true);
    expect(existsSync(VALIDATION_PATH)).toBe(true);
    expect(validateDocumentationRegistry()).toEqual([]);

    const registry = readRegistry();
    const truthIndex = readText(TRUTH_INDEX_PATH);
    const reviewedDate = truthIndex.match(/^Last reviewed: (\d{4}-\d{2}-\d{2}) /m)?.[1];

    expect(reviewedDate).toBeDefined();
    expect(registry.lastReviewedDate).toBe(reviewedDate);
    expect(registry.sourceBaselineCommit).toBe('4dd488f5a681d169615e637366872057ee2e7429');
    expect(truthIndex).not.toContain('canonical B1 files');
    expect(truthIndex).toContain(
      'Newly introduced canonical documents omit `lastVerifiedCommit` until they exist at a stable merged commit that has been verified.',
    );
    expect(registry.documents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          domain: 'repository-operations',
          path: AGENTS_PATH,
          status: 'canonical',
        }),
        expect.objectContaining({
          domain: 'repository-validation',
          path: VALIDATION_PATH,
          status: 'canonical',
        }),
      ]),
    );
    expect(
      registry.documents.find((document) => document.path === AGENTS_PATH)?.lastVerifiedCommit,
    ).toBeUndefined();
    expect(
      registry.documents.find((document) => document.path === VALIDATION_PATH)?.lastVerifiedCommit,
    ).toBeUndefined();
  });

  it('links agents to the truth index, registry, validation hierarchy, and docs safety check', () => {
    const agents = readText(AGENTS_PATH);

    expect(agents).toContain('docs/repository-documentation.md');
    expect(agents).toContain('docs/documentation-registry.json');
    expect(agents).toContain('docs/repository-validation.md');
    expect(agents).toContain('corepack pnpm docs:security:check');
    expect(agents).toContain('Historical or unverified material as context only');
  });

  it('requires approval for production, database, provider, credential, Neon, and Supabase mutations', () => {
    const agents = readText(AGENTS_PATH);
    const approvalSection = section(agents, '## Mutation And Approval Boundaries');

    for (const requiredPhrase of [
      'Merging a PR',
      'Manual Production deployment',
      'Environment-variable changes',
      'Credential rotation',
      'Neon branch creation',
      'Supabase resume',
      'Prisma migration deployment',
      'Manual SQL',
      'Stripe, Printify, Merchize',
      'Provider import Apply',
    ]) {
      expect(approvalSection).toContain(requiredPhrase);
    }

    expect(agents).toContain('unrelated open pull requests');
    expect(agents).toContain('begin a later program phase');
    expect(agents).toContain('unless the current task explicitly');
    expect(agents).toContain('other mutation still requires the applicable owner approval');
  });

  it('keeps validation tiers focused on safe command groups', () => {
    const validation = readText(VALIDATION_PATH);

    for (const tier of [
      'Tier 0',
      'Tier 1',
      'Tier 2',
      'Tier 3',
      'Tier 4',
      'Tier 5',
      'Tier 6',
      'Tier 7',
      'Tier 8',
    ]) {
      expect(validation).toContain(tier);
    }

    expect(validation).toMatch(
      /A validation tier does not authorize implementation or dashboard changes\s+outside the current task's approved scope\./,
    );

    for (const command of [
      'corepack pnpm docs:security:check',
      'corepack pnpm typecheck',
      'corepack pnpm lint',
      'corepack pnpm test',
      'corepack pnpm build',
      'corepack pnpm exec playwright test --list',
      'git diff --check',
    ]) {
      expect(validation).toContain(command);
    }

    const defaultValidation = validation.slice(
      0,
      validation.indexOf('## Package Script Safety Inventory'),
    );
    for (const gatedScript of [
      'db:seed',
      'db:reset',
      'db:migrate',
      'deploy:production',
      'fix:all',
    ]) {
      expect(defaultValidation).not.toContain(`corepack pnpm ${gatedScript}`);
    }
  });

  it('requires Vercel-Neon deployment capacity tracking and visual evidence', () => {
    const agents = readText(AGENTS_PATH);
    const validation = readText(VALIDATION_PATH);
    const combined = `${agents}\n${validation}`;

    for (const requiredPhrase of [
      'Treat every Vercel deployment as capable of creating a Neon branch',
      'Record the current Neon count',
      'Neon count before and after every Vercel deployment',
      'Do not assume repeated deployments reuse an existing branch',
      'Stop if more than one branch appears',
      'Neon reaches `9 / 10`',
    ]) {
      expect(combined).toContain(requiredPhrase);
    }

    for (const requiredPhrase of [
      'Visual implementation is a first-class repository domain',
      'screenshot evidence at desktop, tablet, and mobile sizes',
      'Screenshot evidence at representative desktop, tablet, and mobile sizes',
      'Keyboard navigation review',
      'Screen-reader semantic review',
      'Reduced-motion review',
      'Visual validation must not consist only of `corepack pnpm build`',
    ]) {
      expect(combined).toContain(requiredPhrase);
    }
  });

  it('references only existing package scripts when package scripts are named', () => {
    const scripts = readPackageScripts();
    const validation = readText(VALIDATION_PATH);
    const packageScriptsReferenced = [
      'docs:security:check',
      'typecheck',
      'lint',
      'test',
      'build',
      'db:seed',
      'db:reset',
      'db:migrate',
      'db:deploy',
      'db:seed:shop',
      'db:seed:products',
      'db:seed:runes',
      'seed',
      'seed:app',
      'unseed',
      'prisma:deploy',
      'prisma:reset',
      'setup',
      'deploy',
      'deploy:preview',
      'deploy:production',
      'webhooks:setup',
      'flags:toggle',
      'assets:upload',
      'assets:build',
      'inngest:deploy',
      'fix:all',
      'deps:update',
      'clean:full',
      'logs:clear',
      'webhooks:setup:dry-run',
      'fix:all:dry-run',
    ];

    for (const script of packageScriptsReferenced) {
      expect(scripts[script], script).toBeDefined();
      expect(validation).toContain(`\`${script}\``);
    }
  });

  it('does not authorize PR merge, Production deployment, or raw credential fixtures', () => {
    const combined = `${readText(AGENTS_PATH)}\n${readText(VALIDATION_PATH)}`;

    expect(combined).toContain('Do not run `deploy`, `deploy:preview`, `deploy:production`');
    expect(combined).toContain('Explicit owner approval is required before');
    expect(combined).not.toMatch(/\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}\b/);
    expect(combined).not.toMatch(/\bwhsec_[A-Za-z0-9]{16,}\b/);
    expect(combined).not.toMatch(/\bpostgres(?:ql)?:\/\/[^\s'"`)<>]+/i);
  });
});
