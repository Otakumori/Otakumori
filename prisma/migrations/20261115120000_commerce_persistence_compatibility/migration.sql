-- OTAKU-MORI: additive commerce persistence compatibility.
-- This migration does not authorize checkout or fulfillment.
-- Existing timestamp rows receive CURRENT_TIMESTAMP as a synthetic compatibility
-- backfill; that value is not evidence of the original business event time.

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

DO $migration_preflight$
DECLARE
  completed_migrations INTEGER;
  beta_migration_completed BOOLEAN;
BEGIN
  IF to_regclass('public._prisma_migrations') IS NULL
     OR to_regclass('public."Order"') IS NULL
     OR to_regclass('public."OrderItem"') IS NULL
     OR to_regclass('public."WebhookEvent"') IS NULL THEN
    RAISE EXCEPTION 'Required commerce migration prerequisites are missing';
  END IF;

  IF to_regclass('public."FinancialTransaction"') IS NOT NULL
     OR to_regclass('public."PrintifyOrderSync"') IS NOT NULL THEN
    RAISE EXCEPTION 'Commerce compatibility tables must be absent before migration';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND (
        (table_name = 'WebhookEvent' AND column_name = 'updatedAt')
        OR (table_name = 'OrderItem' AND column_name IN ('createdAt', 'updatedAt'))
      )
  ) THEN
    RAISE EXCEPTION 'One or more target commerce timestamp columns already exist';
  END IF;

  IF (
    SELECT count(*)
    FROM public._prisma_migrations
    WHERE finished_at IS NULL
      AND rolled_back_at IS NULL
      AND migration_name <> '20261115120000_commerce_persistence_compatibility'
  ) <> 0 THEN
    RAISE EXCEPTION 'Unresolved Prisma migration ledger entries block migration';
  END IF;

  SELECT count(*)
  INTO completed_migrations
  FROM public._prisma_migrations
  WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL;

  SELECT EXISTS (
    SELECT 1
    FROM public._prisma_migrations
    WHERE migration_name = '20261102193000_beta_runtime_compatibility'
      AND finished_at IS NOT NULL
      AND rolled_back_at IS NULL
  )
  INTO beta_migration_completed;

  IF completed_migrations = 23 AND beta_migration_completed THEN
    RAISE EXCEPTION 'Unexpected beta migration record on the 23-migration baseline';
  ELSIF completed_migrations = 24 AND NOT beta_migration_completed THEN
    RAISE EXCEPTION 'The 24-migration baseline must include beta_runtime_compatibility';
  ELSIF completed_migrations NOT IN (23, 24) THEN
    RAISE EXCEPTION 'Migration baseline changed: expected 23 or reviewed 24 migrations, found %', completed_migrations;
  END IF;
END;
$migration_preflight$;

ALTER TABLE "public"."WebhookEvent"
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "public"."WebhookEvent"
  ALTER COLUMN "updatedAt" DROP DEFAULT;

ALTER TABLE "public"."OrderItem"
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "public"."OrderItem"
  ALTER COLUMN "updatedAt" DROP DEFAULT;

CREATE TABLE "public"."FinancialTransaction" (
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

CREATE INDEX "FinancialTransaction_orderId_idx"
  ON "public"."FinancialTransaction"("orderId");
CREATE INDEX "FinancialTransaction_type_idx"
  ON "public"."FinancialTransaction"("type");
CREATE INDEX "FinancialTransaction_category_idx"
  ON "public"."FinancialTransaction"("category");
CREATE INDEX "FinancialTransaction_createdAt_idx"
  ON "public"."FinancialTransaction"("createdAt");
CREATE INDEX "FinancialTransaction_stripeChargeId_idx"
  ON "public"."FinancialTransaction"("stripeChargeId");
CREATE INDEX "FinancialTransaction_stripeRefundId_idx"
  ON "public"."FinancialTransaction"("stripeRefundId");

ALTER TABLE "public"."FinancialTransaction"
  ADD CONSTRAINT "FinancialTransaction_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "public"."PrintifyOrderSync" (
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
  ON "public"."PrintifyOrderSync"("localOrderId");
CREATE INDEX "PrintifyOrderSync_localOrderId_idx"
  ON "public"."PrintifyOrderSync"("localOrderId");
CREATE INDEX "PrintifyOrderSync_status_idx"
  ON "public"."PrintifyOrderSync"("status");

ALTER TABLE "public"."PrintifyOrderSync"
  ADD CONSTRAINT "PrintifyOrderSync_localOrderId_fkey"
  FOREIGN KEY ("localOrderId") REFERENCES "public"."Order"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;

-- This is intentionally not a full schema reconciliation. The protected
-- beta_runtime_compatibility migration and unrelated schema drift remain separate.
