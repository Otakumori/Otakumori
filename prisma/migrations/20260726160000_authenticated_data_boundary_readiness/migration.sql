-- Candidate additive migration for authenticated account data readiness.
-- Do not apply directly to Production without the authorized rehearsal plan.

ALTER TABLE "public"."User"
  ADD COLUMN IF NOT EXISTS "avatarBundle" JSONB,
  ADD COLUMN IF NOT EXISTS "avatarConfig" JSONB,
  ADD COLUMN IF NOT EXISTS "avatarRendering" JSONB;

ALTER TABLE "public"."UserAchievement"
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS "public"."Wishlist" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Wishlist_userId_productId_key"
  ON "public"."Wishlist"("userId", "productId");

CREATE INDEX IF NOT EXISTS "Wishlist_productId_idx"
  ON "public"."Wishlist"("productId");

CREATE INDEX IF NOT EXISTS "Wishlist_userId_idx"
  ON "public"."Wishlist"("userId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'Wishlist_userId_fkey'
      AND conrelid = '"public"."Wishlist"'::regclass
  ) THEN
    ALTER TABLE "public"."Wishlist"
      ADD CONSTRAINT "Wishlist_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "public"."User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'Wishlist_productId_fkey'
      AND conrelid = '"public"."Wishlist"'::regclass
  ) THEN
    ALTER TABLE "public"."Wishlist"
      ADD CONSTRAINT "Wishlist_productId_fkey"
      FOREIGN KEY ("productId") REFERENCES "public"."Product"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "public"."PetalWallet" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "balance" INTEGER NOT NULL DEFAULT 0,
  "lifetimeEarned" INTEGER NOT NULL DEFAULT 0,
  "currentStreak" INTEGER NOT NULL DEFAULT 0,
  "lastCollectedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PetalWallet_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PetalWallet_userId_key"
  ON "public"."PetalWallet"("userId");

CREATE INDEX IF NOT EXISTS "PetalWallet_userId_idx"
  ON "public"."PetalWallet"("userId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'PetalWallet_userId_fkey'
      AND conrelid = '"public"."PetalWallet"'::regclass
  ) THEN
    ALTER TABLE "public"."PetalWallet"
      ADD CONSTRAINT "PetalWallet_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "public"."User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "public"."PetalTransaction" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "source" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PetalTransaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PetalTransaction_createdAt_idx"
  ON "public"."PetalTransaction"("createdAt");

CREATE INDEX IF NOT EXISTS "PetalTransaction_source_idx"
  ON "public"."PetalTransaction"("source");

CREATE INDEX IF NOT EXISTS "PetalTransaction_userId_idx"
  ON "public"."PetalTransaction"("userId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'PetalTransaction_userId_fkey'
      AND conrelid = '"public"."PetalTransaction"'::regclass
  ) THEN
    ALTER TABLE "public"."PetalTransaction"
      ADD CONSTRAINT "PetalTransaction_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "public"."User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
