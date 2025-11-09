-- Printify catalog persistence enhancements

-- Extend Product with catalog metadata
ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "visible" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "blueprintId" INTEGER,
  ADD COLUMN IF NOT EXISTS "printProviderId" INTEGER,
  ADD COLUMN IF NOT EXISTS "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "options" JSONB,
  ADD COLUMN IF NOT EXISTS "specs" JSONB,
  ADD COLUMN IF NOT EXISTS "last_synced_at" TIMESTAMP(3);

-- Extend ProductVariant with variant metadata
ALTER TABLE "ProductVariant"
  ADD COLUMN IF NOT EXISTS "title" TEXT,
  ADD COLUMN IF NOT EXISTS "sku" TEXT,
  ADD COLUMN IF NOT EXISTS "grams" INTEGER,
  ADD COLUMN IF NOT EXISTS "isDefaultVariant" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "optionValues" JSONB,
  ADD COLUMN IF NOT EXISTS "costCents" INTEGER,
  ADD COLUMN IF NOT EXISTS "last_synced_at" TIMESTAMP(3);

-- Product images relationship table
CREATE TABLE IF NOT EXISTS "ProductImage" (
  "id" TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
  "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "url" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "variantIds" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes and constraints
CREATE UNIQUE INDEX IF NOT EXISTS "ProductImage_productId_url_key"
  ON "ProductImage"("productId", "url");

CREATE INDEX IF NOT EXISTS "ProductImage_productId_position_idx"
  ON "ProductImage"("productId", "position");

CREATE INDEX IF NOT EXISTS "Product_printifyProductId_idx"
  ON "Product"("printifyProductId");

CREATE INDEX IF NOT EXISTS "ProductVariant_productId_isDefaultVariant_idx"
  ON "ProductVariant"("productId", "isDefaultVariant");

