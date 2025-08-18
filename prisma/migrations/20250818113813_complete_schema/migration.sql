/*
  Warnings:

  - A unique constraint covering the columns `[clerkId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clerkId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."RewardKind" AS ENUM ('PETALS_BONUS', 'COSMETIC', 'OVERLAY', 'COUPON_PERCENT', 'COUPON_AMOUNT', 'RUNE_GRANT', 'TRACK_UNLOCK');

-- CreateEnum
CREATE TYPE "public"."InventoryKind" AS ENUM ('COSMETIC', 'OVERLAY', 'TEXT', 'CURSOR');

-- CreateEnum
CREATE TYPE "public"."DiscountType" AS ENUM ('PERCENT', 'OFF_AMOUNT');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "activeCosmetic" TEXT,
ADD COLUMN     "activeOverlay" TEXT,
ADD COLUMN     "clerkId" TEXT NOT NULL,
ADD COLUMN     "dailyClicks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastClickDayUTC" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "runes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "xp" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."GameRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameKey" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "rewardPetals" INTEGER NOT NULL DEFAULT 0,
    "meta" JSONB,

    CONSTRAINT "GameRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Achievement" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "rewardId" TEXT,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Reward" (
    "id" TEXT NOT NULL,
    "kind" "public"."RewardKind" NOT NULL,
    "sku" TEXT,
    "value" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InventoryItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "kind" "public"."InventoryKind" NOT NULL,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CouponGrant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountType" "public"."DiscountType" NOT NULL,
    "amountOff" INTEGER,
    "percentOff" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "redeemedAt" TIMESTAMP(3),

    CONSTRAINT "CouponGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SoapstoneMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "content" TEXT NOT NULL,
    "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "upvotes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SoapstoneMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SoapstoneLike" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SoapstoneLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LeaderboardScore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "game" TEXT NOT NULL,
    "diff" TEXT,
    "score" INTEGER NOT NULL,
    "statsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaderboardScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShopItem" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "priceRunes" INTEGER,
    "pricePetals" INTEGER,
    "eventTag" TEXT,
    "visibleFrom" TIMESTAMP(3),
    "visibleTo" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameRun_userId_gameKey_idx" ON "public"."GameRun"("userId", "gameKey");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_code_key" ON "public"."Achievement"("code");

-- CreateIndex
CREATE INDEX "Achievement_code_idx" ON "public"."Achievement"("code");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "public"."UserAchievement"("userId", "achievementId");

-- CreateIndex
CREATE INDEX "Reward_kind_idx" ON "public"."Reward"("kind");

-- CreateIndex
CREATE INDEX "Reward_sku_idx" ON "public"."Reward"("sku");

-- CreateIndex
CREATE INDEX "InventoryItem_userId_sku_idx" ON "public"."InventoryItem"("userId", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "CouponGrant_code_key" ON "public"."CouponGrant"("code");

-- CreateIndex
CREATE INDEX "SoapstoneMessage_userId_createdAt_idx" ON "public"."SoapstoneMessage"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SoapstoneMessage_isHidden_createdAt_idx" ON "public"."SoapstoneMessage"("isHidden", "createdAt");

-- CreateIndex
CREATE INDEX "SoapstoneMessage_isFlagged_createdAt_idx" ON "public"."SoapstoneMessage"("isFlagged", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SoapstoneLike_messageId_userId_key" ON "public"."SoapstoneLike"("messageId", "userId");

-- CreateIndex
CREATE INDEX "LeaderboardScore_game_diff_score_idx" ON "public"."LeaderboardScore"("game", "diff", "score");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardScore_userId_game_diff_key" ON "public"."LeaderboardScore"("userId", "game", "diff");

-- CreateIndex
CREATE UNIQUE INDEX "ShopItem_sku_key" ON "public"."ShopItem"("sku");

-- CreateIndex
CREATE INDEX "ShopItem_kind_idx" ON "public"."ShopItem"("kind");

-- CreateIndex
CREATE INDEX "ShopItem_eventTag_idx" ON "public"."ShopItem"("eventTag");

-- CreateIndex
CREATE INDEX "ShopItem_visibleFrom_visibleTo_idx" ON "public"."ShopItem"("visibleFrom", "visibleTo");

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "public"."User"("clerkId");

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "public"."User"("clerkId");

-- AddForeignKey
ALTER TABLE "public"."GameRun" ADD CONSTRAINT "GameRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Achievement" ADD CONSTRAINT "Achievement_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "public"."Reward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "public"."Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryItem" ADD CONSTRAINT "InventoryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CouponGrant" ADD CONSTRAINT "CouponGrant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SoapstoneMessage" ADD CONSTRAINT "SoapstoneMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SoapstoneLike" ADD CONSTRAINT "SoapstoneLike_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."SoapstoneMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
