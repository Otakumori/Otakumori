-- Additive amendment discovered during OTA-30 rehearsal.
-- Do not apply directly to Production without the authorized migration plan.

ALTER TABLE "public"."User"
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
