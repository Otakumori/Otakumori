-- AlterEnum: Add new order statuses
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'paid';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'failed';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'refunded';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'fulfillment_failed';

-- AlterTable: Add new fields to Product
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "externalUrl" TEXT;

-- AlterTable: Add new fields to ProductVariant
ALTER TABLE "ProductVariant" ADD COLUMN IF NOT EXISTS "externalUrl" TEXT;
ALTER TABLE "ProductVariant" ADD COLUMN IF NOT EXISTS "size" TEXT;
ALTER TABLE "ProductVariant" ADD COLUMN IF NOT EXISTS "color" TEXT;
ALTER TABLE "ProductVariant" ADD COLUMN IF NOT EXISTS "material" TEXT;

-- AlterTable: Add new fields to PetalLedger
ALTER TABLE "PetalLedger" ADD COLUMN IF NOT EXISTS "source" TEXT;
ALTER TABLE "PetalLedger" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "PetalLedger" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

-- AlterEnum: Remove deprecated Visibility values (if safe)
-- Note: This will fail if any rows use HIDDEN or REMOVED
-- Run this manually after verifying no data uses these values:
-- ALTER TYPE "Visibility" RENAME TO "Visibility_old";
-- CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'FRIENDS', 'PRIVATE');
-- ALTER TABLE "YourTable" ALTER COLUMN "visibility" TYPE "Visibility" USING "visibility"::text::"Visibility";
-- DROP TYPE "Visibility_old";

