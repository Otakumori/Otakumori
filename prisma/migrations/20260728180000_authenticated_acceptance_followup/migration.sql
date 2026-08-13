-- Additive follow-up for PR #74 authenticated staging acceptance.
-- Do not apply directly to Production without the authorized migration plan.

ALTER TABLE "public"."Order"
  ADD COLUMN IF NOT EXISTS "appliedCouponCodes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "public"."PetalLedger"
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
