-- Controlled-beta runtime compatibility for populated databases that predate
-- the PetalShopItem, GameSave, and GameSession runtime models. This migration is deliberately additive:
-- it does not alter any historical migration or rewrite existing profile choices.

CREATE TABLE "GameSave" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "slot" INTEGER NOT NULL DEFAULT 1,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameSave_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "GameSave_gameId_nonempty" CHECK (btrim("gameId") <> ''),
    CONSTRAINT "GameSave_slot_nonnegative" CHECK ("slot" >= 0)
);

CREATE INDEX "GameSave_gameId_idx" ON "GameSave"("gameId");
CREATE INDEX "GameSave_userId_idx" ON "GameSave"("userId");
CREATE UNIQUE INDEX "GameSave_userId_gameId_slot_key"
    ON "GameSave"("userId", "gameId", "slot");

CREATE TABLE "GameSession" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "score" INTEGER,
    "highScore" INTEGER,
    "actions" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "GameSession_gameId_nonempty" CHECK (btrim("gameId") <> ''),
    CONSTRAINT "GameSession_time_window_valid"
        CHECK ("endTime" IS NULL OR "endTime" >= "startTime")
);

CREATE INDEX "GameSession_gameId_idx" ON "GameSession"("gameId");
CREATE INDEX "GameSession_startTime_idx" ON "GameSession"("startTime");
CREATE INDEX "GameSession_userId_idx" ON "GameSession"("userId");

CREATE TABLE "PetalShopItem" (
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

    CONSTRAINT "PetalShopItem_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PetalShopItem_sku_nonempty" CHECK (btrim("sku") <> ''),
    CONSTRAINT "PetalShopItem_name_nonempty" CHECK (btrim("name") <> ''),
    CONSTRAINT "PetalShopItem_kind_nonempty" CHECK (btrim("kind") <> ''),
    CONSTRAINT "PetalShopItem_priceRunes_nonnegative"
        CHECK ("priceRunes" IS NULL OR "priceRunes" >= 0),
    CONSTRAINT "PetalShopItem_pricePetals_nonnegative"
        CHECK ("pricePetals" IS NULL OR "pricePetals" >= 0),
    CONSTRAINT "PetalShopItem_visibility_window_valid"
        CHECK ("visibleFrom" IS NULL OR "visibleTo" IS NULL OR "visibleTo" >= "visibleFrom")
);

CREATE UNIQUE INDEX "PetalShopItem_sku_key" ON "PetalShopItem"("sku");
CREATE INDEX "PetalShopItem_eventTag_idx" ON "PetalShopItem"("eventTag");
CREATE INDEX "PetalShopItem_kind_idx" ON "PetalShopItem"("kind");
CREATE INDEX "PetalShopItem_visibleFrom_visibleTo_idx"
    ON "PetalShopItem"("visibleFrom", "visibleTo");

ALTER TABLE "GameSave"
    ADD CONSTRAINT "GameSave_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GameSession"
    ADD CONSTRAINT "GameSession_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- New accounts are private by default. Existing explicit visibility values are
-- preserved; changing existing profiles requires a separately approved policy migration.
ALTER TABLE "User" ALTER COLUMN "visibility" SET DEFAULT 'private';

-- Rollback notes (manual and approval-gated; do not execute automatically):
-- 1. Preserve/export all three tables and verify no save, analytics, catalog, or entitlement dependency.
-- 2. Drop GameSession, GameSave, and PetalShopItem only if their runtime paths are withdrawn.
-- 3. Restore the User.visibility default only if the private-by-default policy is reversed.
