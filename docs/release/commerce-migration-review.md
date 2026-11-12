# Commerce persistence compatibility: review gate

**Scope:** Proposed additive Prisma migration, API health false-green correction, and API-health regression coverage. **Not an authorization to merge, migrate Production, enable checkout, or fulfill real orders.**

## Boundaries

Target Prisma migration: `20261112160000_commerce_persistence_compatibility`. Source baseline: `main` at `5655168a4a01eb461501a2ec353d1292aacbfc06`. The migration creates `PrintifyOrderSync` and `FinancialTransaction`, adds five timestamp columns across `WebhookEvent`, `OrderItem`, and `StripeCustomer`, plus required indexes and foreign keys. It intentionally excludes PR #125's beta runtime migration.

The candidate SQL passed a transaction-backed isolated Neon rehearsal on `br-wild-pond-a5skkxmr`; synthetic database contract checks verified uniqueness, foreign keys, ledger replays, webhook deduplication, and cleanup. On a second clean isolated branch, `br-shiny-glitter-a5hlntsc`, Prisma CLI reported 24 migrations on disk, 23 applied and this candidate alone pending. `prisma migrate deploy` was blocked before execution by a tool safety control. **The Prisma migration-ledger write and CLI deployment remain unverified.**

## Application evidence

At exact main SHA, the disposable runner passed 85/85 mocked-provider tests across 12 files, `prisma validate`, `prisma generate`, full TypeScript typecheck with 3 GB Node heap, and focused lint. The newly added health-check regression test in this PR requires an independent CI pass before approval; previous green checks do not certify this change.

## Release gates

Review the exact SQL and its checksum, confirm Production's intended `DATABASE_URL` / `DIRECT_URL` project, branch and database without exposing secrets, and rehearse `prisma migrate deploy` with a secure authorized runner on the clean isolated branch. Verify the `_prisma_migrations` ledger, diff and postflight. Prisma records its own pending migration as started before executing the SQL; the SQL preflight excludes **only this candidate's started row** from its unresolved-migration check, while continuing to block other unresolved entries. If any commerce table gains rows or the migration baseline changes from 23, stop and revisit the data backfill. Do not apply on PR #125 Preview or Production.

The existing Production Prisma workflow only authorizes historical PR #57/#62 migration pairs. **Do not expand its allowlist automatically.** The current source checker may accept HTTP 500 and degraded HTTP 200 as healthy; this PR makes both fail. Separately, the default CI dependency security audit uses `continue-on-error` and should not be interpreted as a clean vulnerability attestation.

This is a narrow first schema compatibility slice. The larger database inventory still has additional absent tables and columns. Do not treat a successful narrow migration as beta or commerce launch approval.
