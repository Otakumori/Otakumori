-- Phase 4A: add provider-neutral variant identity while preserving Printify compatibility.
ALTER TABLE "ProductVariant" ADD COLUMN "provider_variant_id" TEXT;

UPDATE "ProductVariant"
SET "provider_variant_id" = "printifyVariantId"::TEXT
WHERE "printifyVariantId" IS NOT NULL
  AND "provider_variant_id" IS NULL;

ALTER TABLE "ProductVariant" ALTER COLUMN "printifyVariantId" DROP NOT NULL;

CREATE UNIQUE INDEX "ProductVariant_productId_provider_variant_id_key"
  ON "ProductVariant"("productId", "provider_variant_id");

CREATE INDEX "ProductVariant_provider_variant_id_idx"
  ON "ProductVariant"("provider_variant_id");
