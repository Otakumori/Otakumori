# Repository Documentation Truth Index

Last reviewed: 2026-07-22 from source baseline `4dd488f5a681d169615e637366872057ee2e7429`.

This is the current entry point for documentation trust. It does not replace source code, tests, deployment state, or owner approval gates. When this file conflicts with code, current `origin/main` and verified deployment evidence win.

## Canonical Sources

- Documentation registry: `docs/documentation-registry.json`
- Root Codex operating contract: `AGENTS.md`
- Validation hierarchy: `docs/repository-validation.md`
- Documentation safety command: `corepack pnpm docs:security:check`
- Runtime environment schema: `env.mjs`
- GitHub workflows: `.github/workflows/*.yml`
- Prisma schema: `prisma/schema.prisma`
- Provider import audit model: `provider_import_operations` in the deployed Prisma schema

## Current Implementation Areas

- Architecture: inspect code first. Existing architecture notes are partial and are not a complete map yet.
- Development workflow: use `AGENTS.md`, `docs/repository-validation.md`, and repository scripts directly.
- Auth and identity: current source lives under `middleware.ts`, `app/lib/auth*`, Clerk route handlers, and tests under `__tests__/auth`.
- Commerce: current source lives in catalog, checkout, cart, Stripe, Printify, and Merchize code paths. Old commerce-readiness PRs and documents are not merge authority.
- Provider integrations: current behavior must be verified from provider adapters and guarded admin/API routes. No provider write is authorized by documentation alone.
- Database and migrations: use the guarded Production Prisma migration workflow only after owner approval. Do not run manual SQL from docs.
- CI and release: verify against `.github/workflows` and Vercel deployment state, not historical readiness checklists.
- Visual implementation: first-class repository domain, but no canonical visual-system document
  exists yet. Future visual work must audit or replace `docs/design/mori-visual-system.md` if it
  is introduced, and stale visual PRs are reference material only until extracted against current
  `origin/main`.
- Historical/archive material: old setup, completion, session, Cursor, and status notes can be useful context but must not guide current implementation without source verification.

## Trust Rules

- A document marked `canonical` is allowed to guide repository operations for its domain.
- A document marked `current-reference` can support implementation but must be checked against code and tests.
- A document marked `unverified` requires source-code verification before use.
- A document marked `historical`, `stale`, `unsafe`, or `duplicate` must not be used as current instruction.
- Secret-like matches in documentation must be reported by path, line, rule, severity, confidence, classification, and a non-secret-derived finding ID only. Values, authorization headers, database URLs, and value-derived hashes must not be printed in terminal output, PRs, Linear, or chat.
- High-confidence credential-like findings must be blocked unless the exact candidate is structurally recognized as a placeholder, redacted value, public identifier, or environment-variable reference. Finding IDs are location identifiers only and must not authorize downgrading a changed candidate at the same path and line.
- The documentation registry uses `sourceBaselineCommit` to record the audited repository baseline. Newly introduced canonical B1 files intentionally omit `lastVerifiedCommit` until a stable merged commit exists.

## Known Deferred Work

- A generated API/auth matrix is still needed.
- Package script consolidation is still needed.
- Import alias cleanup is still needed.
- Auth, rate-limit, logger, provider-adapter, and health-system consolidation are still deferred.
- Full visual-system implementation is still deferred.
