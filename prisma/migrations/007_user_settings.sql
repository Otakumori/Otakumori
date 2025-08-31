-- User Settings & Preferences System
-- Migration: 007_user_settings.sql

-- User settings for all preferences
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileVisibility" TEXT NOT NULL DEFAULT 'public', -- 'public', 'friends', 'private'
    "allowFriendRequests" BOOLEAN NOT NULL DEFAULT true,
    "allowPartyInvites" BOOLEAN NOT NULL DEFAULT true,
    "allowMessages" BOOLEAN NOT NULL DEFAULT true,
    "activityVisibility" TEXT NOT NULL DEFAULT 'public', -- 'public', 'friends', 'private'
    "leaderboardOptOut" BOOLEAN NOT NULL DEFAULT false,
    "notificationPreferences" JSONB NOT NULL DEFAULT '{"email": true, "push": true, "inApp": true, "friendRequests": true, "partyInvites": true, "achievements": true, "leaderboards": true, "comments": true, "activities": true}',
    "contentFilter" TEXT NOT NULL DEFAULT 'moderate', -- 'strict', 'moderate', 'lenient'
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "theme" TEXT NOT NULL DEFAULT 'auto', -- 'light', 'dark', 'auto'
    "motionReduced" BOOLEAN NOT NULL DEFAULT false,
    "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "musicEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- Privacy settings for specific features
CREATE TABLE "PrivacySettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "showOnlineStatus" BOOLEAN NOT NULL DEFAULT true,
    "showLastSeen" BOOLEAN NOT NULL DEFAULT true,
    "showActivity" BOOLEAN NOT NULL DEFAULT true,
    "showAchievements" BOOLEAN NOT NULL DEFAULT true,
    "showLeaderboardScores" BOOLEAN NOT NULL DEFAULT true,
    "showPartyActivity" BOOLEAN NOT NULL DEFAULT true,
    "showPurchaseHistory" BOOLEAN NOT NULL DEFAULT false,
    "allowSearchIndexing" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrivacySettings_pkey" PRIMARY KEY ("id")
);

-- Game-specific settings
CREATE TABLE "GameSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameCode" TEXT NOT NULL, -- 'petal_samurai', 'puzzle_reveal', 'bubble_girl', 'memory_match'
    "difficulty" TEXT NOT NULL DEFAULT 'normal', -- 'easy', 'normal', 'hard'
    "soundEffects" BOOLEAN NOT NULL DEFAULT true,
    "music" BOOLEAN NOT NULL DEFAULT true,
    "hapticFeedback" BOOLEAN NOT NULL DEFAULT true,
    "autoSave" BOOLEAN NOT NULL DEFAULT true,
    "customSettings" JSONB, -- Game-specific custom settings
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameSettings_pkey" PRIMARY KEY ("id")
);

-- Create indexes for performance
CREATE INDEX "UserSettings_userId_idx" ON "UserSettings"("userId");
CREATE INDEX "UserSettings_profileVisibility_idx" ON "UserSettings"("profileVisibility");
CREATE INDEX "UserSettings_activityVisibility_idx" ON "UserSettings"("activityVisibility");

CREATE INDEX "PrivacySettings_userId_idx" ON "PrivacySettings"("userId");

CREATE INDEX "GameSettings_userId_idx" ON "GameSettings"("userId");
CREATE INDEX "GameSettings_gameCode_idx" ON "GameSettings"("gameCode");
CREATE INDEX "GameSettings_userId_gameCode_idx" ON "GameSettings"("userId", "gameCode");

-- Add foreign key constraints
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PrivacySettings" ADD CONSTRAINT "PrivacySettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GameSettings" ADD CONSTRAINT "GameSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create unique constraints
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");
CREATE UNIQUE INDEX "PrivacySettings_userId_key" ON "PrivacySettings"("userId");
CREATE UNIQUE INDEX "GameSettings_userId_gameCode_key" ON "GameSettings"("userId", "gameCode");
