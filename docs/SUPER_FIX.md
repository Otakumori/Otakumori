# SUPER_FIX Runbook

Status: Phase 0 (security + a11y pre-flight landed), Phase 1 (env/prisma planning)

## Overview

This document tracks the holistic hardening and unification effort for Otaku‑mori. The goals: stabilize APIs/auth/env, standardize error handling and validation, unify UX, and ensure a consistent, auditable petal economy.

## Phases

1. Environment & Config: Harmonize env validation (createEnv + zod), add `scripts/check-env.ts`, document rotation and local vs Vercel.
2. Data Models: Align Prisma models for Petals/Wallet/Entitlements with indexes and idempotent seeds. Backfill if needed.
3. API Surface: Add Zod schemas, guards, centralized Problem+JSON errors, rate‑limits, and idempotent webhooks.
4. Mini‑Games Hub: Boot screen + cube hub layering/input, per‑game routes, Suspense, and score submission.
5. Economy Rules: Caps per source/day, atomic spends, admin tunables.
6. Observability/Perf: Correlation IDs, Sentry, caching, and batched queries.
7. Tests/CI: Vitest + Playwright suites, strict lint and TS.

## Current Changes

- Security: CSP now delivered via `next.config.mjs` with ws:// allowance in dev and wss: in prod.
- A11y: Inputs/selects updated to include `id`/`name` and/or `aria-label`.
- Middleware: Removed CSP duplication; kept HSTS.

## How To Run Locally

```bash
pnpm install
pnpm prisma generate
pnpm dev
```

## Environment

- Primary validation via `env.mjs` (t3‑oss createEnv) and `env.ts` for runtime checks.
- Add `pnpm check-env` (script to be added) to fail CI early when required keys are missing.

## Migrations & Seeds

Use `pnpm prisma migrate deploy` and `pnpm seed` for inserting initial catalog and petal shop items. Idempotent seeds live in `scripts/seed*.ts`.

## Rollback

- Revert the commit range on `main`.
- For migrations, use `prisma migrate resolve --rolled-back` as needed and redeploy with previous image.
