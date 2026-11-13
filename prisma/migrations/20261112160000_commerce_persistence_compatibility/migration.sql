-- OTAKU-MORI / REVIEW-ONLY SQL PROPOSAL / NOT APPROVED FOR EXECUTION
-- Candidate Prisma migration: 20261112160000_commerce_persistence_compatibility
-- Source: main 5655168a4a01eb461501a2ec353d1292aacbfc06 (verified 2026-11-12)
-- Target for eventual isolated rehearsal only: Neon project divine-term-94053009,
-- source branch br-raspy-glitter-a506lvk3, database neondb.
-- Do not apply to Production, existing PR #125 Preview, or the nearly empty
-- otakumori_production database. Confirm runtime connection identity first.
-- The PR #125 beta_runtime_compatibility migration is intentionally excluded.
-- A reviewed Prisma migration path and approved gate change are prerequisites.
-- BACKFILL NOTE: CURRENT_TIMESTAMP on ALTER TABLE creates a compatibility
-- timestamp, not historical truth. Confirm zero affected rows immediately before
-- any rehearsal; if counts differ, stop and design a data-aware backfill.

BEGIN;

-- Fail-closed review gates. Database name alone cannot prove the Neon branch.
-- The release runner MUST also verify project/branch/commit outside SQL.
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

DO $migration_preflight$
BEGIN
    IF current_database() <> 'neondb' THEN
        RAISE EXCEPTION 'Wrong database name: expected neondb';
    END IF;
    IF to_regclass('public."PrintifyOrderSync"') IS NOT NULL
       OR to_regclass('public."FinancialTransaction"') IS NOT NULL THEN
        RAISE EXCEPTION 'Expected commerce tables to be absent';
    END IF;
    -- Prisma inserts this migration's started row before executing its SQL.
    -- Exclude only this candidate; other unresolved rows are always blocking.
    IF (SELECT count(*) FROM public._prisma_migrations
        WHERE finished_at IS NULL AND rolled_back_at IS NULL
          AND migration_name <> '20261112160000_commerce_persistence_compatibility') <> 0 THEN
        RAISE EXCEPTION 'Unresolved Prisma migration ledger entries';
    END IF;
    IF (SELECT count(*) FROM public._prisma_migrations
        WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL) <> 23 THEN
        RAISE EXCEPTION 'Production migration baseline changed; reassess before executing';
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND ((table_name = 'WebhookEvent' AND column_name = 'updatedAt')
            OR (table_name = 'OrderItem' AND column_name IN ('createdAt','updatedAt'))
            OR (table_name = 'StripeCustomer' AND column_name IN ('createdAt','updatedAt')))
    ) THEN
        RAISE EXCEPTION 'One or more target timestamps already exist';
    END IF;
    -- Zero-row baseline on 2026-11-12. New activity requires review of backfill truth.
    IF (SELECT count(*) FROM public."Order") <> 0
       OR (SELECT count(*) FROM public."OrderItem") <> 0
       OR (SELECT count(*) FROM public."WebhookEvent") <> 0
       OR (SELECT count(*) FROM public."StripeCustomer") <> 0 THEN
        RAISE EXCEPTION 'Commerce baseline changed; review data-preserving backfill';
    END IF;
END;
$migration_preflight$;


-- Canonical Printify synchronization and its order lifetime relationship.
CREATE TABLE "PrintifyOrderSync" (
    "id" TEXT NOT NULL,
    "localOrderId" TEXT NOT NULL,
    "printifyOrderId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "lastSyncAt" TIMESTAMP(3),
    "error" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PrintifyOrderSync_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PrintifyOrderSync_localOrderId_key"
    ON "PrintifyOrderSync"("localOrderId");
CREATE INDEX "PrintifyOrderSync_localOrderId_idx"
    ON "PrintifyOrderSync"("localOrderId");
CREATE INDEX "PrintifyOrderSync_status_idx"
    ON "PrintifyOrderSync"("status");

ALTER TABLE "PrintifyOrderSync"
    ADD CONSTRAINT "PrintifyOrderSync_localOrderId_fkey"
    FOREIGN KEY ("localOrderId") REFERENCES "Order"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Stripe reconciliation and financial audit persistence.
CREATE TABLE "FinancialTransaction" (
    "id" TEXT NOT NULL,
    "orderId" TEXT,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "description" TEXT NOT NULL,
    "category" TEXT,
    "stripeChargeId" TEXT,
    "stripeRefundId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FinancialTransaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FinancialTransaction_orderId_idx" ON "FinancialTransaction"("orderId");
CREATE INDEX "FinancialTransaction_type_idx" ON "FinancialTransaction"("type");
CREATE INDEX "FinancialTransaction_category_idx" ON "FinancialTransaction"("category");
CREATE INDEX "FinancialTransaction_createdAt_idx" ON "FinancialTransaction"("createdAt");
CREATE INDEX "FinancialTransaction_stripeChargeId_idx" ON "FinancialTransaction"("stripeChargeId");
CREATE INDEX "FinancialTransaction_stripeRefundId_idx" ON "FinancialTransaction"("stripeRefundId");

ALTER TABLE "FinancialTransaction"
    ADD CONSTRAINT "FinancialTransaction_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Prisma currently expects these existing-model scalar columns.
ALTER TABLE "WebhookEvent"
    ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "OrderItem"
    ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "StripeCustomer"
    ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

COMMIT;

-- NOTE: This is not a full Production schema repair. Separately reconcile
-- the remaining absent tables, 73 other absent scalar columns, and the
-- owner-protected PR #125 beta migration before beta release.
-- ROLLBACK: Do not automatically DROP these tables/columns on a live system.
-- Restore from a verified isolated rehearsal snapshot/PITR or use a deliberate
-- forward repair. Dropping them after real writes would destroy audit data.
