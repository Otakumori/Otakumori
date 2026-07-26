# Authenticated Data Boundary Readiness

Status: candidate only. Do not apply this migration to Production until it has been rehearsed on an authorized temporary Neon branch.

## Source And Target

- Source code baseline: PR #73 head `2f05cc57e8aaa8e5fb5bea59e8a95c79c8773f79`.
- Target schema: current `prisma/schema.prisma` for authenticated account, cart, wishlist, petal, profile, and checkout paths.
- Candidate migration: `prisma/migrations/20260726160000_authenticated_data_boundary_readiness/migration.sql`.

## Verified Production Drift

Read-only evidence shows these Production gaps affect currently executed authenticated code:

- Missing table: `Wishlist`.
- Missing table: `PetalWallet`.
- Missing column: `User.avatarBundle`.
- Missing column: `User.avatarConfig`.
- Missing column: `User.avatarRendering`.
- Missing column: `UserAchievement.updatedAt`.
- Production local `User` row count: zero at time of inspection.

The repository migrations contain existing structures for `PetalLedger`, `UserProfile`, `UserSettings`, and `PrivacySettings`, but no committed migration was found for `Wishlist`, `PetalWallet`, `PetalTransaction`, the avatar JSON fields, or `UserAchievement.updatedAt`.

## Runtime Impact

- `/api/v1/cart` failed because Clerk IDs were used as `Cart.userId`, which references local `User.id`.
- `/api/v1/wishlist` failed because `Wishlist` is missing and the client rendered the structured error object.
- `/api/v1/petals/wallet` failed because `PetalWallet` is missing and the route used the Clerk ID as a relational user key.
- `/profile` returned a guest state while signed in because the page caught database failures as unauthenticated.
- `/api/v1/checkout/session` failed at user loading because `User.avatarBundle` is selected by the generated Prisma client but absent in Production.

## Migration Contents

Additive objects:

- Adds nullable JSON columns `User.avatarBundle`, `User.avatarConfig`, and `User.avatarRendering`.
- Adds `UserAchievement.updatedAt` with a non-null default.
- Creates `Wishlist` with user/product foreign keys, unique user/product pair, and supporting indexes.
- Creates `PetalWallet` with local user foreign key, unique user key, and supporting index.
- Creates `PetalTransaction` with local user foreign key and supporting indexes.

## Lock And Data Analysis

- `ADD COLUMN IF NOT EXISTS` nullable JSON columns should be metadata-only on modern PostgreSQL.
- `UserAchievement.updatedAt` adds a non-null column with a constant default; rehearse for lock duration before Production.
- New empty tables and indexes are additive.
- Foreign keys on newly created empty tables should not scan existing large data.
- No data deletion, table drop, enum narrowing, destructive rename, reset, or migration-history rewrite is included.

## Backfill

- Because Production currently has zero local `User` rows, no immediate local user backfill is required for existing rows.
- Existing Clerk accounts still require lazy provisioning on next authenticated request or a separately authorized controlled backfill.
- Do not use checkout shipping data as account identity.

## Validation Plan

On an authorized temporary Neon branch only:

1. Apply the candidate migration.
2. Confirm required tables, columns, indexes, and foreign keys exist.
3. Run focused authenticated-boundary tests.
4. Smoke account routes without creating provider orders or payments.
5. Confirm no raw Prisma errors reach browser responses.
6. Delete only the task-created temporary branch after explicit cleanup authorization.

## Rollback Strategy

The preferred rollback is code rollback because the migration is additive and compatible with current main and PR #73. Dropping new objects is not authorized as an automatic rollback because it can destroy user data after traffic begins writing to those tables.

## Deployment Order

1. Rehearse migration on a temporary Neon branch.
2. Push the stacked code branch only after rehearsal passes.
3. Merge PR #73 first or include its auth routing state in the same staged release plan.
4. Apply the Production migration through a separately authorized migration prompt.
5. Deploy code that depends on the local viewer boundary and schema.
6. Perform read-only Production smoke tests.
