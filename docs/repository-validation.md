# Repository Validation Hierarchy

This is the canonical validation hierarchy for Otakumori repository work. It lists practical
commands and approval boundaries. It does not authorize provider writes, database mutations,
manual deployment, or environment changes.

## Tier 0 - Universal Inspection

Use for every change:

- Confirm branch, SHA, and worktree cleanliness.
- Inspect relevant source, tests, package scripts, and executable configuration.
- Inspect relevant documentation-registry entries.
- Review `git diff --name-only`.
- Review `git diff --stat`.
- Run `git diff --check` before completion.

Do not run mutating commands as validation.

## Tier 1 - Documentation And Operational Text

Use for Markdown, examples, setup text, YAML operational text, templates, repository contracts,
or documentation registry changes:

- `corepack pnpm docs:security:check`
- Focused documentation or contract tests.
- `git diff --check`

Escalate when documentation changes executable configuration, package scripts, or workflow
behavior.

## Tier 2 - Focused Code Change

Use for isolated implementation with focused tests:

- Relevant targeted Vitest command, for example `corepack pnpm exec vitest run <test-file>`.
- `corepack pnpm typecheck`
- `corepack pnpm lint`
- `git diff --check`

Escalate when shared infrastructure, routes, auth, providers, build behavior, or commerce paths
are touched.

## Tier 3 - Application Or Shared-Code Change

Use for shared code, route behavior, UI behavior, common helpers, or build-impacting changes:

- `corepack pnpm typecheck`
- `corepack pnpm lint`
- `corepack pnpm test`
- `corepack pnpm build`
- `corepack pnpm exec playwright test --list`
- `git diff --check`

Add focused tests for the changed domain.

## Tier 4 - Auth Or Security Change

Require:

- Relevant auth or security tests.
- Full Tier 3 validation.
- Route and middleware inspection.
- Verification that public and protected behavior remain intentional.
- Owner-side browser verification when dashboard or session behavior is material.

Do not change Clerk dashboard settings without separate owner approval. Do not run authenticated
destructive smoke tests. A validation tier does not authorize implementation or dashboard changes
outside the current task's approved scope.

## Tier 5 - Provider, Checkout, Order, Or Fulfillment Change

Require:

- Focused adapter and route tests.
- Full Tier 3 validation.
- Dry-run or read-only evidence where supported.
- Explicit confirmation that no provider write occurred.

Separate owner approval is required for any Apply, webhook setup, checkout, payment, order,
fulfillment, or import action. A passing unit test does not authorize a provider write.

## Tier 6 - Prisma Or Migration Change

### Schema/client-only inspection

Allowed without database mutation after source inspection:

- Inspect `prisma/schema.prisma`.
- Run safe generation or audit commands only after inspecting their implementation.
- Run focused tests and full Tier 3 validation.

### Migration or database mutation

Approval-gated:

- `prisma migrate deploy`
- `prisma migrate dev`
- Database reset.
- Seed or unseed.
- Manual SQL.
- Production migration workflow.
- Neon branch actions.

Do not run these without explicit owner authorization and a dedicated migration prompt.

## Tier 7 - Deployment Or Production Verification

Deployment validation is read-only unless explicitly authorized. Require:

- GitHub check inspection.
- Vercel deployment inspection.
- Source-SHA verification.
- Alias verification.
- Neon count before and after deployment.
- Exact Neon branch names and IDs created by deployment.
- Read-only smoke tests.
- Runtime error review.

Do not run `deploy`, `deploy:preview`, `deploy:production`, or manual redeployment unless the
owner explicitly authorizes that action. Automatic Preview deployment triggered by a Draft PR is
acceptable only when it does not create an unauthorized Neon branch or alter Supabase.

Treat every Vercel Preview, Production deployment, redeployment, or correction deployment as a
possible Neon branch creation event until the post-deployment branch inventory proves otherwise.

## Tier 8 - Visual And UX Change

Visual validation must prove the user-facing experience, not only compilation. Require:

- Focused component or route tests for changed behavior.
- Full Tier 3 validation when shared UI, commerce UI, navigation, or layout primitives change.
- Screenshot evidence at representative desktop, tablet, and mobile sizes.
- Keyboard navigation review.
- Screen-reader semantic review.
- Contrast review.
- Reduced-motion review.
- Loading-state, empty-state, error-state, and unavailable-state review.
- Responsive layout and image-crop review.
- Performance review.
- Confirmation that product information, stock/availability, variant selection, cart actions,
  checkout actions, and other purchase controls remain clear when commerce surfaces are touched.

Visual validation must not consist only of `corepack pnpm build`.

## Package Script Safety Inventory

These scripts exist in `package.json` and require source inspection before use:

- Standard validation scripts: `docs:security:check`, `typecheck`, `lint`, `test`, `build`.
- Direct validation commands: `corepack pnpm exec playwright test --list`,
  `node -e "require('./lighthouserc.cjs'); console.log('lighthouserc loaded')"`.
- Database and Prisma gated scripts: `db:seed`, `db:reset`, `db:migrate`, `db:deploy`,
  `db:seed:shop`, `db:seed:products`, `db:seed:runes`, `seed`, `seed:app`, `unseed`,
  `prisma:deploy`, `prisma:reset`, `setup`.
- Deployment and external-service gated scripts: `deploy`, `deploy:preview`,
  `deploy:production`, `webhooks:setup`, `flags:toggle`, `assets:upload`, `assets:build`,
  `inngest:deploy`.
- Broad mutation or cleanup gated scripts: `fix:all`, `deps:update`, `clean:full`,
  `logs:clear`.
- Dry-run scripts that still require source inspection: `webhooks:setup:dry-run`,
  `fix:all:dry-run`.
