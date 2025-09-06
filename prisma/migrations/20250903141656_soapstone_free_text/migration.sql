/*
  Warnings:

  - You are about to drop the column `content` on the `SoapstoneMessage` table. All the data in the column will be lost.
  - You are about to drop the column `isFlagged` on the `SoapstoneMessage` table. All the data in the column will be lost.
  - You are about to drop the column `isHidden` on the `SoapstoneMessage` table. All the data in the column will be lost.
  - You are about to drop the column `rotation` on the `SoapstoneMessage` table. All the data in the column will be lost.
  - You are about to drop the column `upvotes` on the `SoapstoneMessage` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `SoapstoneMessage` table. All the data in the column will be lost.
  - You are about to drop the `SoapstoneLike` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updated_at` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorId` to the `SoapstoneMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `SoapstoneMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SoapstoneMessage` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Visibility" AS ENUM ('PUBLIC', 'HIDDEN', 'REMOVED');

-- CreateEnum
CREATE TYPE "public"."ReactionType" AS ENUM ('APPRAISE', 'DOWNVOTE', 'LAUGH', 'HEART', 'FIRE', 'SKULL');

-- DropForeignKey
ALTER TABLE "public"."SoapstoneLike" DROP CONSTRAINT "SoapstoneLike_messageId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SoapstoneMessage" DROP CONSTRAINT "SoapstoneMessage_userId_fkey";

-- DropIndex
DROP INDEX "public"."SoapstoneMessage_isFlagged_createdAt_idx";

-- DropIndex
DROP INDEX "public"."SoapstoneMessage_isHidden_createdAt_idx";

-- DropIndex
DROP INDEX "public"."SoapstoneMessage_userId_createdAt_idx";

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."SoapstoneMessage" DROP COLUMN "content",
DROP COLUMN "isFlagged",
DROP COLUMN "isHidden",
DROP COLUMN "rotation",
DROP COLUMN "upvotes",
DROP COLUMN "userId",
ADD COLUMN     "appraises" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "authorId" TEXT NOT NULL,
ADD COLUMN     "overlayURL" TEXT,
ADD COLUMN     "postId" TEXT,
ADD COLUMN     "reports" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" "public"."Visibility" NOT NULL DEFAULT 'PUBLIC',
ADD COLUMN     "text" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "x" INTEGER,
ADD COLUMN     "y" INTEGER;

-- DropTable
DROP TABLE "public"."SoapstoneLike";

-- CreateTable
CREATE TABLE "public"."ProductView" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Reaction" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."ReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Review" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "images" JSONB NOT NULL DEFAULT '[]',
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HomeRail" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "product_slugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeRail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Rune" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "power" INTEGER NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rune_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RuneUnlock" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RuneUnlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PetalCollection" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "count" INTEGER NOT NULL,
    "positionX" DOUBLE PRECISION NOT NULL,
    "positionY" DOUBLE PRECISION NOT NULL,
    "isAuthenticated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetalCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "petals" INTEGER NOT NULL DEFAULT 0,
    "runes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StripeCustomer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,

    CONSTRAINT "StripeCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WebhookEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Cart" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CartItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductView_productId_createdAt_idx" ON "public"."ProductView"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "ProductView_userId_createdAt_idx" ON "public"."ProductView"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_messageId_userId_type_key" ON "public"."Reaction"("messageId", "userId", "type");

-- CreateIndex
CREATE INDEX "Review_productId_idx" ON "public"."Review"("productId");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "public"."Review"("userId");

-- CreateIndex
CREATE INDEX "Review_is_approved_idx" ON "public"."Review"("is_approved");

-- CreateIndex
CREATE INDEX "Review_created_at_idx" ON "public"."Review"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "HomeRail_key_key" ON "public"."HomeRail"("key");

-- CreateIndex
CREATE INDEX "HomeRail_key_idx" ON "public"."HomeRail"("key");

-- CreateIndex
CREATE INDEX "HomeRail_starts_at_ends_at_idx" ON "public"."HomeRail"("starts_at", "ends_at");

-- CreateIndex
CREATE UNIQUE INDEX "Rune_slug_key" ON "public"."Rune"("slug");

-- CreateIndex
CREATE INDEX "Rune_slug_idx" ON "public"."Rune"("slug");

-- CreateIndex
CREATE INDEX "Rune_power_idx" ON "public"."Rune"("power");

-- CreateIndex
CREATE INDEX "RuneUnlock_userId_idx" ON "public"."RuneUnlock"("userId");

-- CreateIndex
CREATE INDEX "RuneUnlock_slug_idx" ON "public"."RuneUnlock"("slug");

-- CreateIndex
CREATE INDEX "RuneUnlock_unlockedAt_idx" ON "public"."RuneUnlock"("unlockedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RuneUnlock_userId_slug_key" ON "public"."RuneUnlock"("userId", "slug");

-- CreateIndex
CREATE INDEX "PetalCollection_userId_idx" ON "public"."PetalCollection"("userId");

-- CreateIndex
CREATE INDEX "PetalCollection_isAuthenticated_idx" ON "public"."PetalCollection"("isAuthenticated");

-- CreateIndex
CREATE INDEX "PetalCollection_createdAt_idx" ON "public"."PetalCollection"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "public"."Wallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "public"."Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StripeCustomer_userId_key" ON "public"."StripeCustomer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StripeCustomer_customerId_key" ON "public"."StripeCustomer"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_key" ON "public"."Cart"("userId");

-- CreateIndex
CREATE INDEX "Cart_userId_idx" ON "public"."Cart"("userId");

-- CreateIndex
CREATE INDEX "CartItem_cartId_idx" ON "public"."CartItem"("cartId");

-- CreateIndex
CREATE INDEX "CartItem_productId_idx" ON "public"."CartItem"("productId");

-- CreateIndex
CREATE INDEX "CartItem_productVariantId_idx" ON "public"."CartItem"("productVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_productId_productVariantId_key" ON "public"."CartItem"("cartId", "productId", "productVariantId");

-- CreateIndex
CREATE INDEX "Product_created_at_idx" ON "public"."Product"("created_at");

-- CreateIndex
CREATE INDEX "Product_updated_at_idx" ON "public"."Product"("updated_at");

-- CreateIndex
CREATE INDEX "SoapstoneMessage_postId_idx" ON "public"."SoapstoneMessage"("postId");

-- CreateIndex
CREATE INDEX "SoapstoneMessage_authorId_idx" ON "public"."SoapstoneMessage"("authorId");

-- AddForeignKey
ALTER TABLE "public"."SoapstoneMessage" ADD CONSTRAINT "SoapstoneMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reaction" ADD CONSTRAINT "Reaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."SoapstoneMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RuneUnlock" ADD CONSTRAINT "RuneUnlock_slug_fkey" FOREIGN KEY ("slug") REFERENCES "public"."Rune"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StripeCustomer" ADD CONSTRAINT "StripeCustomer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "public"."Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "public"."ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
