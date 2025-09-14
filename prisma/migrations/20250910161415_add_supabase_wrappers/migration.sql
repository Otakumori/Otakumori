-- CreateTable
CREATE TABLE "public"."ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "imageUrl" TEXT,
    "userId" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gamertag" TEXT,
    "gamertagChangedAt" TIMESTAMP(3),
    "bannerKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserPetals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "total" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPetals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserInventory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemKey" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GlobalPetals" (
    "id" TEXT NOT NULL,
    "total" INTEGER NOT NULL DEFAULT 0,
    "goal" INTEGER,
    "eventName" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlobalPetals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuestProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuestClaim" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Soapstone" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Soapstone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SoapstoneVote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "soapstoneId" TEXT NOT NULL,
    "vote" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SoapstoneVote_pkey" PRIMARY KEY ("id")
);

-- Create schemas for external data integration
CREATE SCHEMA IF NOT EXISTS external;

-- Create tables to store external API data
CREATE TABLE external.clerk_users (
  id text PRIMARY KEY,
  identifier text,
  identifier_type text,
  instance_id text,
  created_at timestamp,
  updated_at timestamp,
  attrs jsonb,
  invitation_id text,
  last_synced_at timestamp DEFAULT NOW()
);

CREATE TABLE external.stripe_customers (
  id text PRIMARY KEY,
  email text,
  name text,
  created timestamp,
  currency text,
  metadata jsonb,
  last_synced_at timestamp DEFAULT NOW()
);

CREATE TABLE external.stripe_products (
  id text PRIMARY KEY,
  name text,
  active boolean,
  created timestamp,
  description text,
  metadata jsonb,
  last_synced_at timestamp DEFAULT NOW()
);

CREATE TABLE external.stripe_prices (
  id text PRIMARY KEY,
  product text,
  active boolean,
  created timestamp,
  currency text,
  unit_amount bigint,
  last_synced_at timestamp DEFAULT NOW()
);

CREATE TABLE external.printify_products (
  id text PRIMARY KEY,
  title text,
  description text,
  created_at timestamp,
  visible boolean,
  last_synced_at timestamp DEFAULT NOW()
);

CREATE TABLE external.printify_orders (
  id text PRIMARY KEY,
  external_id text,
  total_price decimal,
  status text,
  created_at timestamp,
  last_synced_at timestamp DEFAULT NOW()
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "public"."UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPetals_userId_key" ON "public"."UserPetals"("userId");

-- CreateIndex
CREATE INDEX "UserInventory_userId_idx" ON "public"."UserInventory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserInventory_userId_itemKey_key" ON "public"."UserInventory"("userId", "itemKey");

-- CreateIndex
CREATE INDEX "QuestProgress_userId_idx" ON "public"."QuestProgress"("userId");

-- CreateIndex
CREATE INDEX "QuestProgress_questId_idx" ON "public"."QuestProgress"("questId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestProgress_userId_date_questId_key" ON "public"."QuestProgress"("userId", "date", "questId");

-- CreateIndex
CREATE INDEX "QuestClaim_userId_idx" ON "public"."QuestClaim"("userId");

-- CreateIndex
CREATE INDEX "QuestClaim_questId_idx" ON "public"."QuestClaim"("questId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestClaim_userId_date_questId_key" ON "public"."QuestClaim"("userId", "date", "questId");

-- CreateIndex
CREATE INDEX "Soapstone_userId_idx" ON "public"."Soapstone"("userId");

-- CreateIndex
CREATE INDEX "Soapstone_score_idx" ON "public"."Soapstone"("score");

-- CreateIndex
CREATE INDEX "Soapstone_createdAt_idx" ON "public"."Soapstone"("createdAt");

-- CreateIndex
CREATE INDEX "SoapstoneVote_userId_idx" ON "public"."SoapstoneVote"("userId");

-- CreateIndex
CREATE INDEX "SoapstoneVote_soapstoneId_idx" ON "public"."SoapstoneVote"("soapstoneId");

-- CreateIndex
CREATE UNIQUE INDEX "SoapstoneVote_userId_soapstoneId_key" ON "public"."SoapstoneVote"("userId", "soapstoneId");

-- Create indexes for external data performance
CREATE INDEX idx_clerk_users_identifier ON external.clerk_users(identifier);
CREATE INDEX idx_clerk_users_created_at ON external.clerk_users(created_at);
CREATE INDEX idx_stripe_customers_email ON external.stripe_customers(email);
CREATE INDEX idx_stripe_products_active ON external.stripe_products(active);
CREATE INDEX idx_printify_products_visible ON external.printify_products(visible);

-- AddForeignKey
ALTER TABLE "public"."ContactMessage" ADD CONSTRAINT "ContactMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Note: Permissions will be handled by Supabase RLS policies
