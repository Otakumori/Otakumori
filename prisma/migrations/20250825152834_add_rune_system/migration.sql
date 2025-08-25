-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."LedgerType" ADD VALUE 'burst_bonus';
ALTER TYPE "public"."LedgerType" ADD VALUE 'seasonal';
ALTER TYPE "public"."LedgerType" ADD VALUE 'purchase_bonus';
ALTER TYPE "public"."LedgerType" ADD VALUE 'first_purchase_bonus';
ALTER TYPE "public"."LedgerType" ADD VALUE 'milestone_bonus';
ALTER TYPE "public"."LedgerType" ADD VALUE 'combo_reveal';

-- DropForeignKey
ALTER TABLE "public"."RewardLedger" DROP CONSTRAINT "RewardLedger_userId_fkey";

-- DropIndex
DROP INDEX "public"."OrderItem_productVariantId_idx";

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "subtotalCents" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."OrderItem" ADD COLUMN     "upc" TEXT;

-- AlterTable
ALTER TABLE "public"."PetalLedger" ADD COLUMN     "guestSessionId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."RewardLedger" ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."GuestSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MergeLog" (
    "id" TEXT NOT NULL,
    "guestSessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mergedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guestPetalCountAtMerge" INTEGER NOT NULL,
    "userPetalCountBefore" INTEGER NOT NULL,
    "userPetalCountAfter" INTEGER NOT NULL,

    CONSTRAINT "MergeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SiteConfig" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "guestCap" INTEGER NOT NULL DEFAULT 50,
    "burst" JSONB NOT NULL DEFAULT '{"enabled":true,"minCooldownSec":15,"maxPerMinute":3,"particleCount":{"small":20,"medium":40,"large":80},"rarityWeights":{"small":0.6,"medium":0.3,"large":0.1}}',
    "tree" JSONB NOT NULL DEFAULT '{"sway":0.5,"spawnRate":2000,"snapPx":4,"dither":0.3}',
    "theme" JSONB NOT NULL DEFAULT '{"pinkIntensity":0.7,"grayIntensity":0.8,"motionIntensity":2}',
    "seasonal" JSONB NOT NULL DEFAULT '{"sakuraBoost":false,"springMode":false,"autumnMode":false}',
    "rewards" JSONB NOT NULL DEFAULT '{"baseRateCents":300,"minPerOrder":5,"maxPerOrder":120,"streak":{"enabled":true,"dailyBonusPct":0.05,"maxPct":0.25},"seasonal":{"multiplier":1.0},"daily":{"softCap":200,"postSoftRatePct":0.5,"hardCap":400},"firstPurchaseBonus":20}',
    "runes" JSONB NOT NULL DEFAULT '{"defs":[],"combos":[],"gacha":{"enabled":false}}',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "SiteConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RuneDef" (
    "id" TEXT NOT NULL,
    "canonicalId" TEXT NOT NULL,
    "displayName" TEXT,
    "glyph" TEXT,
    "lore" TEXT,
    "printifyUPCs" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuneDef_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RuneCombo" (
    "id" TEXT NOT NULL,
    "comboId" TEXT NOT NULL,
    "members" TEXT[],
    "revealCopy" TEXT,
    "cosmeticBurst" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuneCombo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RuneComboMember" (
    "id" TEXT NOT NULL,
    "comboId" TEXT NOT NULL,
    "runeId" TEXT NOT NULL,

    CONSTRAINT "RuneComboMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserRune" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "runeId" TEXT NOT NULL,
    "orderId" TEXT,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRune_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "orderId" TEXT,
    "to" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'resend',
    "template" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "meta" JSONB,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GuestSession_createdAt_idx" ON "public"."GuestSession"("createdAt");

-- CreateIndex
CREATE INDEX "GuestSession_lastSeenAt_idx" ON "public"."GuestSession"("lastSeenAt");

-- CreateIndex
CREATE INDEX "MergeLog_userId_mergedAt_idx" ON "public"."MergeLog"("userId", "mergedAt");

-- CreateIndex
CREATE INDEX "MergeLog_guestSessionId_mergedAt_idx" ON "public"."MergeLog"("guestSessionId", "mergedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MergeLog_guestSessionId_userId_key" ON "public"."MergeLog"("guestSessionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "RuneDef_canonicalId_key" ON "public"."RuneDef"("canonicalId");

-- CreateIndex
CREATE INDEX "RuneDef_canonicalId_idx" ON "public"."RuneDef"("canonicalId");

-- CreateIndex
CREATE INDEX "RuneDef_isActive_idx" ON "public"."RuneDef"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "RuneCombo_comboId_key" ON "public"."RuneCombo"("comboId");

-- CreateIndex
CREATE INDEX "RuneCombo_comboId_idx" ON "public"."RuneCombo"("comboId");

-- CreateIndex
CREATE INDEX "RuneCombo_isActive_idx" ON "public"."RuneCombo"("isActive");

-- CreateIndex
CREATE INDEX "RuneComboMember_comboId_idx" ON "public"."RuneComboMember"("comboId");

-- CreateIndex
CREATE INDEX "RuneComboMember_runeId_idx" ON "public"."RuneComboMember"("runeId");

-- CreateIndex
CREATE UNIQUE INDEX "RuneComboMember_comboId_runeId_key" ON "public"."RuneComboMember"("comboId", "runeId");

-- CreateIndex
CREATE INDEX "UserRune_userId_acquiredAt_idx" ON "public"."UserRune"("userId", "acquiredAt");

-- CreateIndex
CREATE INDEX "UserRune_runeId_idx" ON "public"."UserRune"("runeId");

-- CreateIndex
CREATE INDEX "UserRune_orderId_idx" ON "public"."UserRune"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRune_userId_runeId_key" ON "public"."UserRune"("userId", "runeId");

-- CreateIndex
CREATE INDEX "EmailLog_userId_idx" ON "public"."EmailLog"("userId");

-- CreateIndex
CREATE INDEX "EmailLog_orderId_idx" ON "public"."EmailLog"("orderId");

-- CreateIndex
CREATE INDEX "EmailLog_status_idx" ON "public"."EmailLog"("status");

-- CreateIndex
CREATE INDEX "EmailLog_sentAt_idx" ON "public"."EmailLog"("sentAt");

-- CreateIndex
CREATE INDEX "OrderItem_printifyVariantId_idx" ON "public"."OrderItem"("printifyVariantId");

-- CreateIndex
CREATE INDEX "OrderItem_upc_idx" ON "public"."OrderItem"("upc");

-- CreateIndex
CREATE INDEX "PetalLedger_guestSessionId_createdAt_idx" ON "public"."PetalLedger"("guestSessionId", "createdAt");

-- CreateIndex
CREATE INDEX "PetalLedger_guestSessionId_type_createdAt_idx" ON "public"."PetalLedger"("guestSessionId", "type", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."RewardLedger" ADD CONSTRAINT "RewardLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PetalLedger" ADD CONSTRAINT "PetalLedger_guestSessionId_fkey" FOREIGN KEY ("guestSessionId") REFERENCES "public"."GuestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MergeLog" ADD CONSTRAINT "MergeLog_guestSessionId_fkey" FOREIGN KEY ("guestSessionId") REFERENCES "public"."GuestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MergeLog" ADD CONSTRAINT "MergeLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RuneComboMember" ADD CONSTRAINT "RuneComboMember_comboId_fkey" FOREIGN KEY ("comboId") REFERENCES "public"."RuneCombo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RuneComboMember" ADD CONSTRAINT "RuneComboMember_runeId_fkey" FOREIGN KEY ("runeId") REFERENCES "public"."RuneDef"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserRune" ADD CONSTRAINT "UserRune_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserRune" ADD CONSTRAINT "UserRune_runeId_fkey" FOREIGN KEY ("runeId") REFERENCES "public"."RuneDef"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserRune" ADD CONSTRAINT "UserRune_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailLog" ADD CONSTRAINT "EmailLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailLog" ADD CONSTRAINT "EmailLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
