-- Sprint 1: Social Foundation Migration
-- Follows, Blocks, Presence, Profile 2.0

-- Profile visibility and sections
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "visibility" TEXT DEFAULT 'public' CHECK ("visibility" IN ('public','friends','private'));
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bio" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "location" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "website" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "banner_url" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatar_url" TEXT;

-- Profile sections (reorderable, toggleable)
CREATE TABLE IF NOT EXISTS "ProfileSection" (
  "id" TEXT PRIMARY KEY DEFAULT (cuid()),
  "profileId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "code" TEXT NOT NULL, -- 'about','showcase','stats','achievements','collections'
  "orderIdx" INTEGER NOT NULL,
  "visible" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Profile links (curated, validated)
CREATE TABLE IF NOT EXISTS "ProfileLink" (
  "id" TEXT PRIMARY KEY DEFAULT (cuid()),
  "profileId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "label" TEXT NOT NULL, -- 'Portfolio','X','Bluesky','Itch'
  "url" TEXT NOT NULL,
  "orderIdx" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Profile themes (light customization, safe)
CREATE TABLE IF NOT EXISTS "ProfileTheme" (
  "profileId" TEXT PRIMARY KEY REFERENCES "User"("id") ON DELETE CASCADE,
  "themeCode" TEXT NOT NULL DEFAULT 'glass_pink', -- 'glass_pink','ink_dark','retro_ps2'
  "accentHex" TEXT NOT NULL DEFAULT '#ec4899',
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Follows (asymmetric; derived 'friends' when mutual follows exist)
CREATE TABLE IF NOT EXISTS "Follow" (
  "followerId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "followeeId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("followerId", "followeeId")
);

-- Blocks (comprehensive blocking system)
CREATE TABLE IF NOT EXISTS "Block" (
  "blockerId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "blockedId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("blockerId", "blockedId")
);

-- Presence and activity tracking
CREATE TABLE IF NOT EXISTS "Presence" (
  "profileId" TEXT PRIMARY KEY REFERENCES "User"("id") ON DELETE CASCADE,
  "status" TEXT DEFAULT 'online' CHECK ("status" IN ('online','idle','dnd','offline')),
  "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "activity" JSONB DEFAULT '{}'::jsonb, -- {page:'mini-games', game:'petal-samurai'}
  "showActivity" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "ProfileSection_profileId_idx" ON "ProfileSection"("profileId");
CREATE INDEX IF NOT EXISTS "ProfileSection_orderIdx_idx" ON "ProfileSection"("orderIdx");
CREATE INDEX IF NOT EXISTS "ProfileLink_profileId_idx" ON "ProfileLink"("profileId");
CREATE INDEX IF NOT EXISTS "ProfileLink_orderIdx_idx" ON "ProfileLink"("orderIdx");
CREATE INDEX IF NOT EXISTS "Follow_followerId_idx" ON "Follow"("followerId");
CREATE INDEX IF NOT EXISTS "Follow_followeeId_idx" ON "Follow"("followeeId");
CREATE INDEX IF NOT EXISTS "Block_blockerId_idx" ON "Block"("blockerId");
CREATE INDEX IF NOT EXISTS "Block_blockedId_idx" ON "Block"("blockedId");
CREATE INDEX IF NOT EXISTS "Presence_status_idx" ON "Presence"("status");
CREATE INDEX IF NOT EXISTS "Presence_lastSeen_idx" ON "Presence"("lastSeen");

-- Insert default profile sections for existing users
INSERT INTO "ProfileSection" ("profileId", "code", "orderIdx", "visible")
SELECT 
  "id",
  "code",
  "orderIdx",
  true
FROM "User"
CROSS JOIN (
  VALUES 
    ('about', 0),
    ('stats', 1),
    ('achievements', 2),
    ('collections', 3)
) AS sections("code", "orderIdx")
WHERE NOT EXISTS (
  SELECT 1 FROM "ProfileSection" ps 
  WHERE ps."profileId" = "User"."id" AND ps."code" = sections."code"
);

-- Insert default profile themes for existing users
INSERT INTO "ProfileTheme" ("profileId", "themeCode", "accentHex")
SELECT "id", 'glass_pink', '#ec4899'
FROM "User"
WHERE NOT EXISTS (
  SELECT 1 FROM "ProfileTheme" pt WHERE pt."profileId" = "User"."id"
);
