# Commerce persistence compatibility: review gate

**Scope:** Proposed additive Prisma migration, API health false-green correction, and API-health regression coverage. **Not an authorization to merge, migrate Production, enable checkout, or fulfill real orders.**

## Boundaries

Target Prisma migration: `20261112160000_commerce_persistence_compatibility`. Source baseline: `main` at `5655168a4a01eb461501a2ec353d1292aacbfc06`. The migration creates `PrintifyOrderSync` and `FinancialTransaction`, adds five timestamp columns across `WebhookEvent`, `OrderItem`, and `StripeCustomer`, plus required indexes and foreign keys. It does not duplicate PR #125's beta runtime objects, but its ledger preflight accepts either the reviewed 23-migration baseline or the exact 24-migration baseline containing `20261102193000_beta_runtime_compatibility`.

The consolidated SQL passed local PostgreSQL 18.3 Prisma rehearsals from both accepted baselines: 23 to 24 migrations and exact beta-24 to 25 migrations, with zero unresolved entries, preserved synthetic rows, correct Prisma timestamp defaults, and no pending migration on repeat deploy. The reverse operational order—commerce first, then the exact protected beta SQL—also produced 25 completed migrations and preserved both schema families.

On 2026-11-15, an explicitly authorized rehearsal applied the exact migration checksum `B07AC4CDE388A4005A3DB883C378460A525E5D1284B9D69162FEA6EB94659965` once to the isolated nonproduction Neon branch `br-shiny-glitter-a5hlntsc`, database `neondb`. Preflight verified 23 completed migrations, zero unresolved entries, and only this migration pending. Postflight verified 24 completed, zero unresolved, the exact checksum, expected tables, columns, defaults, constraints, and indexes, with relevant existing row counts preserved. This evidence does not authorize Production migration.

## Health-check certification design

The pull-request API Health workflow exercises a real, disposable PostgreSQL 16 service (`otm_ci_health`) with local-only test credentials and synthetic provider placeholders. Its pre-build connectivity assertion proves Prisma reaches the exact CI database, and the API checker additionally requires HTTP 200 **and** `{ ok: true, status: "healthy" }`. It never obtains live provider secrets for pull-request jobs. Checkout remains source-controlled disabled.

For trusted `push` events on `main` or `develop`, the same workflow continues using the configured secret-backed target. A pull-request green result certifies **isolated application health behavior**, not Production database availability. Separate Production runtime health verification and target identity attestation remain required prior to release.

## Application evidence

The local consolidation passed 63 focused health, migration, checkout, webhook, ledger, and fulfillment tests across 14 files, followed by the complete 917-test Vitest suite. Prisma validation, TypeScript, pre-build validation, documentation security, and full lint (zero errors; baseline warnings only) also passed. Remote CI remains unverified because this branch has not been published.

## Release gates

Review the exact SQL and checksum, confirm the direct connection identifies the authorized project, branch, and `neondb` without exposing secrets, and rehearse `prisma migrate deploy` only after exact-target approval. Verify `_prisma_migrations`, preserved rows, schema diff, and postflight. Prisma records its own pending migration as started before executing SQL; the preflight excludes **only this candidate's started row** while blocking every other unresolved entry. Stop if the baseline is neither 23 nor the exact beta-24 sequence, or if any target object already exists. Do not apply on PR #125 Preview or Production.

The existing Production Prisma workflow only authorizes historical PR #57/#62 migration pairs. **Do not expand its allowlist automatically.** The health checker now rejects HTTP 500 and degraded HTTP 200 responses.

## Dependency-security gate

The integrated candidate resolves the five previously reported critical advisories with Next.js `15.5.29`, Sentry `10.75.2`, and transitive `shell-quote` `1.11.0`. `pnpm audit --prod --audit-level critical` exits successfully, and the CI critical audit is release-blocking. High, moderate, and low advisory debt remains visible and requires separate risk review; it is not represented as fully remediated.

This is a narrow first schema compatibility slice. The larger database inventory still has additional absent tables and columns. Do not treat a successful narrow migration as beta or commerce launch approval.
