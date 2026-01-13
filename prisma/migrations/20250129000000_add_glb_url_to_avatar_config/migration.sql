-- AlterTable: Add GLB URL fields to AvatarConfiguration
ALTER TABLE "AvatarConfiguration" 
  ADD COLUMN IF NOT EXISTS "glbUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "glbGeneratedAt" TIMESTAMP(3);

-- CreateIndex: Add index on glbUrl for faster lookups
CREATE INDEX IF NOT EXISTS "AvatarConfiguration_glbUrl_idx" ON "AvatarConfiguration"("glbUrl");

