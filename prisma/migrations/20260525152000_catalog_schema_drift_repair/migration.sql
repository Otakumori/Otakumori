-- Forward-only catalog schema drift repair for Preview/staging databases.
-- This intentionally mirrors only the catalog columns, indexes, and sync log
-- table required by provider catalog sync. It is idempotent so stale Preview
-- databases can be repaired without replaying broad historical migrations.

ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "category_slug" TEXT,
  ADD COLUMN IF NOT EXISTS "integration_ref" TEXT,
  ADD COLUMN IF NOT EXISTS "last_synced_at" TIMESTAMP(3);

ALTER TABLE "ProductVariant"
  ADD COLUMN IF NOT EXISTS "last_synced_at" TIMESTAMP(3);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Product'
      AND column_name = 'integration_ref'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM "Product"
    WHERE "integration_ref" IS NOT NULL
    GROUP BY "integration_ref"
    HAVING COUNT(*) > 1
  ) THEN
    CREATE UNIQUE INDEX IF NOT EXISTS "Product_integration_ref_key"
      ON "Product"("integration_ref");
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Product'
      AND column_name = 'active'
  )
  AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Product'
      AND column_name = 'category_slug'
  ) THEN
    CREATE INDEX IF NOT EXISTS "Product_active_category_slug_idx"
      ON "Product"("active", "category_slug");
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Product_category_slug_idx"
  ON "Product"("category_slug");

CREATE INDEX IF NOT EXISTS "Product_integration_ref_idx"
  ON "Product"("integration_ref");

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Product'
      AND column_name = 'printifyProductId'
  ) THEN
    CREATE INDEX IF NOT EXISTS "Product_printifyProductId_idx"
      ON "Product"("printifyProductId");
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "PrintifySyncLog" (
  "id" TEXT NOT NULL,
  "syncType" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "orderId" TEXT,
  "status" TEXT NOT NULL,
  "attempt" INTEGER NOT NULL DEFAULT 1,
  "requestPayload" JSONB,
  "responsePayload" JSONB,
  "errorCode" TEXT,
  "errorMessage" TEXT,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PrintifySyncLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PrintifySyncLog_syncType_status_idx"
  ON "PrintifySyncLog"("syncType", "status");

CREATE INDEX IF NOT EXISTS "PrintifySyncLog_entityType_entityId_idx"
  ON "PrintifySyncLog"("entityType", "entityId");

CREATE INDEX IF NOT EXISTS "PrintifySyncLog_orderId_idx"
  ON "PrintifySyncLog"("orderId");

CREATE INDEX IF NOT EXISTS "PrintifySyncLog_createdAt_idx"
  ON "PrintifySyncLog"("createdAt");

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'Order'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'PrintifySyncLog_orderId_fkey'
  ) THEN
    ALTER TABLE "PrintifySyncLog"
      ADD CONSTRAINT "PrintifySyncLog_orderId_fkey"
      FOREIGN KEY ("orderId")
      REFERENCES "Order"("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;
