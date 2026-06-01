-- Provider-neutral fulfillment attempts and append-oriented accounting ledger.
-- This migration is intentionally additive. It does not backfill historical
-- orders or mutate existing provider sync rows.

DO $$
BEGIN
  CREATE TYPE "FulfillmentProvider" AS ENUM ('printify', 'merchize', 'manual', 'disabled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "FulfillmentAttemptStatus" AS ENUM ('pending', 'dry_run', 'skipped', 'succeeded', 'failed', 'manual_review');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "TaxLedgerEntryType" AS ENUM (
    'SALE_GROSS',
    'DISCOUNT',
    'SHIPPING_CHARGED',
    'TAX_COLLECTED',
    'STRIPE_FEE',
    'REFUND',
    'PROVIDER_PRODUCTION_COST',
    'PROVIDER_SHIPPING_COST',
    'BUSINESS_EXPENSE',
    'NET_REVENUE_ESTIMATE'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "FulfillmentAttempt" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "provider" "FulfillmentProvider" NOT NULL,
  "status" "FulfillmentAttemptStatus" NOT NULL DEFAULT 'pending',
  "externalOrderId" TEXT,
  "idempotencyKey" TEXT NOT NULL,
  "sourceEventId" TEXT,
  "sourceReference" TEXT,
  "attemptCount" INTEGER NOT NULL DEFAULT 1,
  "requestSummary" JSONB,
  "responseSummary" JSONB,
  "errorCode" TEXT,
  "errorMessage" VARCHAR(500),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FulfillmentAttempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BusinessExpense" (
  "id" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "vendor" TEXT,
  "description" TEXT NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "incurredAt" TIMESTAMP(3) NOT NULL,
  "paidAt" TIMESTAMP(3),
  "sourceProvider" TEXT,
  "sourceReference" TEXT,
  "receiptUrl" TEXT,
  "metadata" JSONB,
  "orderId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BusinessExpense_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TaxLedgerEntry" (
  "id" TEXT NOT NULL,
  "orderId" TEXT,
  "businessExpenseId" TEXT,
  "entryType" "TaxLedgerEntryType" NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "customerJurisdiction" TEXT,
  "sourceProvider" TEXT NOT NULL,
  "sourceEventId" TEXT,
  "sourceReference" TEXT,
  "idempotencyKey" TEXT NOT NULL,
  "reversalOfEntryId" TEXT,
  "occurredAt" TIMESTAMP(3) NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TaxLedgerEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "FulfillmentAttempt_idempotencyKey_key"
  ON "FulfillmentAttempt"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "FulfillmentAttempt_orderId_idx"
  ON "FulfillmentAttempt"("orderId");
CREATE INDEX IF NOT EXISTS "FulfillmentAttempt_provider_status_idx"
  ON "FulfillmentAttempt"("provider", "status");
CREATE INDEX IF NOT EXISTS "FulfillmentAttempt_sourceEventId_idx"
  ON "FulfillmentAttempt"("sourceEventId");

CREATE UNIQUE INDEX IF NOT EXISTS "TaxLedgerEntry_idempotencyKey_key"
  ON "TaxLedgerEntry"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "TaxLedgerEntry_orderId_entryType_idx"
  ON "TaxLedgerEntry"("orderId", "entryType");
CREATE INDEX IF NOT EXISTS "TaxLedgerEntry_businessExpenseId_idx"
  ON "TaxLedgerEntry"("businessExpenseId");
CREATE INDEX IF NOT EXISTS "TaxLedgerEntry_entryType_occurredAt_idx"
  ON "TaxLedgerEntry"("entryType", "occurredAt");
CREATE INDEX IF NOT EXISTS "TaxLedgerEntry_sourceProvider_sourceEventId_idx"
  ON "TaxLedgerEntry"("sourceProvider", "sourceEventId");
CREATE INDEX IF NOT EXISTS "TaxLedgerEntry_occurredAt_idx"
  ON "TaxLedgerEntry"("occurredAt");

CREATE INDEX IF NOT EXISTS "BusinessExpense_category_incurredAt_idx"
  ON "BusinessExpense"("category", "incurredAt");
CREATE INDEX IF NOT EXISTS "BusinessExpense_orderId_idx"
  ON "BusinessExpense"("orderId");
CREATE INDEX IF NOT EXISTS "BusinessExpense_sourceProvider_sourceReference_idx"
  ON "BusinessExpense"("sourceProvider", "sourceReference");
CREATE INDEX IF NOT EXISTS "BusinessExpense_incurredAt_idx"
  ON "BusinessExpense"("incurredAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'FulfillmentAttempt_orderId_fkey'
  ) THEN
    ALTER TABLE "FulfillmentAttempt"
      ADD CONSTRAINT "FulfillmentAttempt_orderId_fkey"
      FOREIGN KEY ("orderId") REFERENCES "Order"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'BusinessExpense_orderId_fkey'
  ) THEN
    ALTER TABLE "BusinessExpense"
      ADD CONSTRAINT "BusinessExpense_orderId_fkey"
      FOREIGN KEY ("orderId") REFERENCES "Order"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'TaxLedgerEntry_orderId_fkey'
  ) THEN
    ALTER TABLE "TaxLedgerEntry"
      ADD CONSTRAINT "TaxLedgerEntry_orderId_fkey"
      FOREIGN KEY ("orderId") REFERENCES "Order"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'TaxLedgerEntry_businessExpenseId_fkey'
  ) THEN
    ALTER TABLE "TaxLedgerEntry"
      ADD CONSTRAINT "TaxLedgerEntry_businessExpenseId_fkey"
      FOREIGN KEY ("businessExpenseId") REFERENCES "BusinessExpense"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
