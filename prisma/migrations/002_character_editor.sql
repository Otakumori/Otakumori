-- Character Editor Migration
-- PS1/PS2 style character customization with retro rendering

-- Character customization options
CREATE TABLE "CharacterPreset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL, -- 'hair', 'face', 'body', 'clothing', 'accessories'
    "meshData" JSONB NOT NULL, -- Low-poly mesh data
    "textureData" JSONB NOT NULL, -- Retro texture mapping
    "colorPalette" JSONB NOT NULL, -- Available color options
    "rarity" TEXT NOT NULL DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
    "unlockCondition" JSONB, -- How to unlock this preset
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterPreset_pkey" PRIMARY KEY ("id")
);

-- User character configurations
CREATE TABLE "CharacterConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "configData" JSONB NOT NULL, -- Complete character configuration
    "meshData" JSONB NOT NULL, -- Compiled mesh data for rendering
    "textureData" JSONB NOT NULL, -- Compiled texture data
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterConfig_pkey" PRIMARY KEY ("id")
);

-- Character reactions for different contexts
CREATE TABLE "CharacterReaction" (
    "id" TEXT NOT NULL,
    "characterConfigId" TEXT NOT NULL,
    "context" TEXT NOT NULL, -- 'home', 'shop', 'games', 'social', 'achievements'
    "reactionType" TEXT NOT NULL, -- 'idle', 'happy', 'excited', 'focused', 'sleepy'
    "animationData" JSONB NOT NULL, -- Animation keyframes and timing
    "triggerConditions" JSONB, -- When to trigger this reaction
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterReaction_pkey" PRIMARY KEY ("id")
);

-- User's unlocked character presets
CREATE TABLE "UserCharacterPreset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "presetId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCharacterPreset_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "CharacterPreset_category_idx" ON "CharacterPreset"("category");
CREATE INDEX "CharacterPreset_rarity_idx" ON "CharacterPreset"("rarity");
CREATE INDEX "CharacterConfig_userId_idx" ON "CharacterConfig"("userId");
CREATE INDEX "CharacterConfig_isActive_idx" ON "CharacterConfig"("isActive");
CREATE INDEX "CharacterReaction_characterConfigId_idx" ON "CharacterReaction"("characterConfigId");
CREATE INDEX "CharacterReaction_context_idx" ON "CharacterReaction"("context");
CREATE INDEX "UserCharacterPreset_userId_idx" ON "UserCharacterPreset"("userId");
CREATE INDEX "UserCharacterPreset_presetId_idx" ON "UserCharacterPreset"("presetId");

-- Add foreign key constraints
ALTER TABLE "CharacterConfig" ADD CONSTRAINT "CharacterConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CharacterReaction" ADD CONSTRAINT "CharacterReaction_characterConfigId_fkey" FOREIGN KEY ("characterConfigId") REFERENCES "CharacterConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserCharacterPreset" ADD CONSTRAINT "UserCharacterPreset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserCharacterPreset" ADD CONSTRAINT "UserCharacterPreset_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "CharacterPreset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add unique constraints
CREATE UNIQUE INDEX "CharacterConfig_userId_isActive_unique" ON "CharacterConfig"("userId", "isActive") WHERE "isActive" = true;
CREATE UNIQUE INDEX "UserCharacterPreset_userId_presetId_unique" ON "UserCharacterPreset"("userId", "presetId");
