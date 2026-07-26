-- Additive amendment discovered during OTA-30 synthetic provisioning rehearsal.
-- Do not apply directly to Production without the authorized migration plan.

ALTER TABLE "public"."Wallet"
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
