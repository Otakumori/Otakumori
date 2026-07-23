# Otakumori Codex Operating Contract

This repository is the source of truth for Otakumori engineering. Inspect current code,
tests, scripts, workflows, deployment state, and registered documentation before changing
anything. Historical notes can provide context, but they cannot authorize implementation,
provider actions, database actions, or Production actions.

## Repository Truth Order

Use this precedence when evidence conflicts:

1. Current `origin/main` source code.
2. Tests and executable configuration.
3. Current GitHub workflow definitions.
4. Verified deployment and provider state.
5. Canonical entries in `docs/documentation-registry.json`.
6. Current-reference documentation checked against code.
7. Historical or unverified material as context only.

Start with `docs/repository-documentation.md` and `docs/documentation-registry.json` for
documentation status. Documents marked `historical`, `stale`, `unsafe`, `duplicate`, or
`unverified` must not guide current implementation or provider operations without source
verification.

## Inspect Before Editing

Before editing, inspect and report:

- Current branch, SHA, and worktree cleanliness.
- Relevant source, tests, package scripts, and executable configuration.
- Relevant documentation-registry entries.
- Related open PRs and Linear issues when accessible.
- Whether the task can trigger provider, environment, database, deployment, or Production
  mutation.
- Current Neon capacity and Supabase state when Vercel, deployment, database, provider, or
  repository-operations work is in scope.

Stop when the prompt SHA, branch, deployment, provider state, or worktree materially differs
from the task assumptions.

## Scope Discipline

Use a clean worktree and a dedicated branch. Keep changed files minimal. Do not perform
opportunistic refactors, unrelated formatting sweeps, or stale-branch reuse. Do not modify
unrelated open pull requests or begin a later program phase unless the current task explicitly
places that work in scope. Any merge, provider, database, environment, deployment, credential,
or other mutation still requires the applicable owner approval.

## Secret Handling

Run `corepack pnpm docs:security:check` for documentation, setup, template, YAML, shell, or
operational-text changes. Never print raw secrets, complete database URLs, authorization-header
contents, secret-derived fingerprints, or secret-derived hashes. Do not place credentials in
GitHub, Linear, logs, terminal summaries, documentation, or chat. Report candidate findings only
with bounded non-secret metadata. Signed-in browser access does not authorize viewing, copying,
or exporting secrets.

## Mutation And Approval Boundaries

Read-only verification is different from mutation. Explicit owner approval is required before:

- Merging a PR.
- Manual Production deployment.
- Environment-variable changes.
- Credential rotation.
- Neon branch creation, deletion, reset, rename, or restore.
- Supabase resume, branch, migration, or configuration change.
- Prisma migration deployment.
- Manual SQL.
- Database reset, seed, unseed, destructive cleanup, or provider-backed import.
- Clerk dashboard changes.
- Stripe, Printify, Merchize, webhook, order, fulfillment, checkout, or provider writes.
- Feature-flag mutation.
- Provider import Apply.
- Git-history rewrite.

## Vercel-Neon Deployment Budget

Treat every Vercel deployment as capable of creating a Neon branch until direct evidence proves
reuse. This includes Preview deployments, Production deployments, redeployments, correction
deployments, and deployment-triggering pings.

Before any remote push or deployment-triggering action:

- Record the current Neon count and visible branch list.
- Finish local implementation and validation first.
- Minimize pushes; keep corrections on the same Git branch.
- Do not create cosmetic or evidence-only deployments.

After every Vercel deployment:

- Verify the Vercel deployment ID, state, source SHA, and target.
- Record the Neon count again.
- Identify every Neon branch created by the deployment, including name, ID, parent, creation
  actor, associated Git branch, PR, and Vercel deployment.
- Stop if more than one branch appears, an unrelated branch appears, an existing branch changes,
  the Preview source SHA is unexpected, Supabase changes, or Neon reaches `9 / 10` without
  explicit owner approval.

Do not assume repeated deployments reuse an existing branch. Do not manually redeploy without
owner approval.

## Known High-Risk Commands

Inspect script source before running any command whose side effects are unclear. These package
scripts are approval-gated or high risk:

- Database and Prisma: `db:seed`, `db:reset`, `db:migrate`, `db:deploy`, `db:seed:shop`,
  `db:seed:products`, `db:seed:runes`, `seed`, `seed:app`, `unseed`, `prisma:deploy`,
  `prisma:reset`, `setup`.
- Deployment and external services: `deploy`, `deploy:preview`, `deploy:production`,
  `webhooks:setup`, `flags:toggle`, `assets:upload`, `assets:build`, `inngest:deploy`.
- Broad mutation or cleanup: `fix:all`, `deps:update`, `clean:full`, `logs:clear`.

Dry-run labels do not override source inspection or owner constraints. Treat
`webhooks:setup:dry-run` and `fix:all:dry-run` as lower risk only after verifying their
implementation and target environment.

## Validation Hierarchy

Use `docs/repository-validation.md` as the canonical validation hierarchy. Choose the smallest
tier that proves the change, and escalate when touched scope or risk increases. Do not run
mutating commands as validation.

## Visual Domain

Visual implementation is a first-class repository domain. Preserve the Otakumori dark sakura
storybook marketplace direction instead of replacing it with generic SaaS styling. Future visual
work must identify functional behavior, visual states, responsive behavior, accessibility,
reduced-motion behavior, loading, empty, error, and unavailable states, performance impact, and
screenshot evidence at desktop, tablet, and mobile sizes. Product and commerce visuals must keep
purchase actions, product information, stock state, and checkout trust clear. Stale visual PRs
must be extracted against current `origin/main` before reuse.

## Pull Request Evidence

Every completion report must include:

- Starting and ending SHA.
- Branch and worktree.
- Changed files.
- Tests and validations actually run.
- Commands not run and why.
- GitHub checks, Vercel state, and Vercel source SHA when applicable.
- Neon count before and after every Vercel deployment.
- Exact Neon branches created by deployment when applicable.
- Provider, database, deployment, and environment actions performed, or confirmation that none
  occurred.
- Neon state when relevant.
- Supabase state when relevant.
- Related open pull request status when relevant.
- Remaining owner actions.
- Full safety confirmation.

## Stop Conditions

Stop when:

- The expected SHA differs materially.
- The worktree is unexpectedly dirty.
- A secret appears.
- A provider write, database mutation, migration, manual SQL, feature-flag change, environment
  change, or Production action becomes necessary but is unauthorized.
- A Neon branch would be created unexpectedly.
- Supabase would need to be resumed or changed.
- Production state differs from assumptions.
- Required validation fails.
- Scope expands beyond the assigned phase.
