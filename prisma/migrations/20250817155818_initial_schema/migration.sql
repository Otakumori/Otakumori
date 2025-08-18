-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('pending', 'pending_mapping', 'in_production', 'shipped', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."LedgerType" AS ENUM ('earn', 'spend', 'adjust');

-- CreateTable
CREATE TABLE "public"."ContentPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "body" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeId" TEXT NOT NULL,
    "paymentIntentId" TEXT,
    "chargeId" TEXT,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'pending',
    "totalAmount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "shippedAt" TIMESTAMP(3),
    "trackingUrl" TEXT,
    "carrier" TEXT,
    "trackingNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "petalsAwarded" INTEGER NOT NULL DEFAULT 0,
    "printifyId" TEXT,
    "memoryCardKey" TEXT,
    "displayNumber" SERIAL NOT NULL,
    "primaryItemName" TEXT DEFAULT '',
    "label" TEXT DEFAULT '',

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitAmount" INTEGER NOT NULL,
    "printifyProductId" TEXT,
    "printifyVariantId" INTEGER,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "primaryImageUrl" TEXT,
    "stripeProductId" TEXT,
    "printifyProductId" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "previewImageUrl" TEXT,
    "printifyVariantId" INTEGER NOT NULL,
    "printProviderName" TEXT,
    "leadMinDays" INTEGER,
    "leadMaxDays" INTEGER,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "priceCents" INTEGER,
    "currency" TEXT DEFAULT 'USD',
    "stripePriceId" TEXT,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RewardLedger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RewardLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "display_name" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "petalBalance" INTEGER NOT NULL DEFAULT 0,
    "hideRewardsExplainer" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PetalLedger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."LedgerType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetalLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductReview" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "imageUrls" TEXT[],
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IdempotencyKey" (
    "key" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdempotencyKey_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentPage_slug_key" ON "public"."ContentPage"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripeId_key" ON "public"."Order"("stripeId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_displayNumber_key" ON "public"."Order"("displayNumber");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "public"."OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productVariantId_idx" ON "public"."OrderItem"("productVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_stripeProductId_key" ON "public"."Product"("stripeProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_printifyProductId_key" ON "public"."Product"("printifyProductId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_stripePriceId_key" ON "public"."ProductVariant"("stripePriceId");

-- CreateIndex
CREATE INDEX "ProductVariant_printifyVariantId_idx" ON "public"."ProductVariant"("printifyVariantId");

-- CreateIndex
CREATE INDEX "ProductVariant_stripePriceId_idx" ON "public"."ProductVariant"("stripePriceId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_productId_printifyVariantId_key" ON "public"."ProductVariant"("productId", "printifyVariantId");

-- CreateIndex
CREATE INDEX "RewardLedger_orderId_idx" ON "public"."RewardLedger"("orderId");

-- CreateIndex
CREATE INDEX "RewardLedger_userId_createdAt_idx" ON "public"."RewardLedger"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE INDEX "PetalLedger_userId_createdAt_idx" ON "public"."PetalLedger"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PetalLedger_userId_type_createdAt_idx" ON "public"."PetalLedger"("userId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "ProductReview_productId_createdAt_idx" ON "public"."ProductReview"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "ProductReview_isApproved_createdAt_idx" ON "public"."ProductReview"("isApproved", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "public"."ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RewardLedger" ADD CONSTRAINT "RewardLedger_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RewardLedger" ADD CONSTRAINT "RewardLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PetalLedger" ADD CONSTRAINT "PetalLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
