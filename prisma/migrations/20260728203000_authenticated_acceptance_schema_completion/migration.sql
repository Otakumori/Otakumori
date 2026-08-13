-- Additive completion for PR #74 authenticated staging acceptance.
-- Do not apply directly to Production without the authorized migration plan.

ALTER TABLE "public"."Activity"
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "public"."Order"
  ADD COLUMN IF NOT EXISTS "taxAmount" INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "shippingAmount" INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "discountAmount" INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "refundAmount" INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "refundedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "notes" TEXT;
