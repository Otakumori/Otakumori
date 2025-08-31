/*
  Warnings:

  - A unique constraint covering the columns `[integration_ref]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "public"."LedgerType" ADD VALUE 'preset_unlock';

-- AlterTable
ALTER TABLE "public"."LeaderboardScore" ADD COLUMN     "boardId" TEXT,
ADD COLUMN     "meta" JSONB,
ADD COLUMN     "profileId" TEXT,
ADD COLUMN     "rank" INTEGER;

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "category_slug" TEXT,
ADD COLUMN     "integration_ref" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "visibility" TEXT NOT NULL DEFAULT 'public',
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "public"."CharacterPreset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "meshData" JSONB NOT NULL,
    "textureData" JSONB NOT NULL,
    "colorPalette" JSONB NOT NULL,
    "rarity" TEXT NOT NULL DEFAULT 'common',
    "unlockCondition" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterPreset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CharacterConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "configData" JSONB NOT NULL,
    "meshData" JSONB NOT NULL,
    "textureData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CharacterReaction" (
    "id" TEXT NOT NULL,
    "characterConfigId" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "reactionType" TEXT NOT NULL,
    "animationData" JSONB NOT NULL,
    "triggerConditions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserCharacterPreset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "presetId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCharacterPreset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProfileSection" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "orderIdx" INTEGER NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProfileLink" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "orderIdx" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProfileTheme" (
    "profileId" TEXT NOT NULL,
    "themeCode" TEXT NOT NULL DEFAULT 'glass_pink',
    "accentHex" TEXT NOT NULL DEFAULT '#ec4899',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileTheme_pkey" PRIMARY KEY ("profileId")
);

-- CreateTable
CREATE TABLE "public"."Follow" (
    "followerId" TEXT NOT NULL,
    "followeeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("followerId","followeeId")
);

-- CreateTable
CREATE TABLE "public"."Block" (
    "blockerId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("blockerId","blockedId")
);

-- CreateTable
CREATE TABLE "public"."Presence" (
    "profileId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'online',
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activity" JSONB NOT NULL DEFAULT '{}',
    "showActivity" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Presence_pkey" PRIMARY KEY ("profileId")
);

-- CreateTable
CREATE TABLE "public"."Activity" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Leaderboard" (
    "id" TEXT NOT NULL,
    "gameCode" TEXT NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'global',
    "period" TEXT NOT NULL DEFAULT 'daily',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "parentId" TEXT,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isModerated" BOOLEAN NOT NULL DEFAULT false,
    "moderationReason" TEXT,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "replyCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommentLike" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommentReport" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "moderatorId" TEXT,
    "moderatorNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "CommentReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Party" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "leaderId" TEXT NOT NULL,
    "maxMembers" INTEGER NOT NULL DEFAULT 4,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "gameMode" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PartyMember" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "permissions" JSONB,

    CONSTRAINT "PartyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PartyInvitation" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "inviteeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "PartyInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CoopSession" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,
    "gameId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "settings" JSONB,
    "progress" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoopSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CoopSessionParticipant" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'player',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "stats" JSONB,

    CONSTRAINT "CoopSessionParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PartyMessage" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'text',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartyMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserReport" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reportedUserId" TEXT,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "evidence" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "assignedModeratorId" TEXT,
    "moderatorNotes" TEXT,
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "UserReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ModerationAction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" JSONB,
    "reportId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appealedAt" TIMESTAMP(3),
    "appealStatus" TEXT NOT NULL DEFAULT 'none',

    CONSTRAINT "ModerationAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContentModeration" (
    "id" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "automatedScore" DECIMAL(65,30),
    "moderatorId" TEXT,
    "moderatorNotes" TEXT,
    "flags" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "ContentModeration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserSafetySettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "allowFriendRequests" BOOLEAN NOT NULL DEFAULT true,
    "allowPartyInvites" BOOLEAN NOT NULL DEFAULT true,
    "allowMessages" BOOLEAN NOT NULL DEFAULT true,
    "blockedUsers" TEXT[],
    "contentFilter" TEXT NOT NULL DEFAULT 'moderate',
    "reportNotifications" BOOLEAN NOT NULL DEFAULT true,
    "moderationNotifications" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSafetySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ModeratorRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "permissions" JSONB NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "ModeratorRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ModerationAppeal" (
    "id" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "evidence" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "ModerationAppeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SearchHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "searchType" TEXT NOT NULL,
    "filters" JSONB,
    "resultCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SearchSuggestion" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "suggestionType" TEXT NOT NULL,
    "targetId" TEXT,
    "targetType" TEXT,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "lastUsed" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SearchSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SearchAnalytics" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "searchType" TEXT NOT NULL,
    "resultCount" INTEGER NOT NULL,
    "clickedResultId" TEXT,
    "clickedResultType" TEXT,
    "sessionId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileVisibility" TEXT NOT NULL DEFAULT 'public',
    "allowFriendRequests" BOOLEAN NOT NULL DEFAULT true,
    "allowPartyInvites" BOOLEAN NOT NULL DEFAULT true,
    "allowMessages" BOOLEAN NOT NULL DEFAULT true,
    "activityVisibility" TEXT NOT NULL DEFAULT 'public',
    "leaderboardOptOut" BOOLEAN NOT NULL DEFAULT false,
    "notificationPreferences" JSONB NOT NULL DEFAULT '{"email": true, "push": true, "inApp": true, "friendRequests": true, "partyInvites": true, "achievements": true, "leaderboards": true, "comments": true, "activities": true}',
    "contentFilter" TEXT NOT NULL DEFAULT 'moderate',
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "theme" TEXT NOT NULL DEFAULT 'auto',
    "motionReduced" BOOLEAN NOT NULL DEFAULT false,
    "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "musicEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PrivacySettings" (
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

-- CreateTable
CREATE TABLE "public"."GameSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameCode" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'normal',
    "soundEffects" BOOLEAN NOT NULL DEFAULT true,
    "music" BOOLEAN NOT NULL DEFAULT true,
    "hapticFeedback" BOOLEAN NOT NULL DEFAULT true,
    "autoSave" BOOLEAN NOT NULL DEFAULT true,
    "customSettings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CharacterPreset_category_idx" ON "public"."CharacterPreset"("category");

-- CreateIndex
CREATE INDEX "CharacterPreset_rarity_idx" ON "public"."CharacterPreset"("rarity");

-- CreateIndex
CREATE INDEX "CharacterConfig_userId_idx" ON "public"."CharacterConfig"("userId");

-- CreateIndex
CREATE INDEX "CharacterConfig_isActive_idx" ON "public"."CharacterConfig"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterConfig_userId_isActive_unique" ON "public"."CharacterConfig"("userId", "isActive");

-- CreateIndex
CREATE INDEX "CharacterReaction_characterConfigId_idx" ON "public"."CharacterReaction"("characterConfigId");

-- CreateIndex
CREATE INDEX "CharacterReaction_context_idx" ON "public"."CharacterReaction"("context");

-- CreateIndex
CREATE INDEX "UserCharacterPreset_userId_idx" ON "public"."UserCharacterPreset"("userId");

-- CreateIndex
CREATE INDEX "UserCharacterPreset_presetId_idx" ON "public"."UserCharacterPreset"("presetId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCharacterPreset_userId_presetId_key" ON "public"."UserCharacterPreset"("userId", "presetId");

-- CreateIndex
CREATE INDEX "ProfileSection_profileId_idx" ON "public"."ProfileSection"("profileId");

-- CreateIndex
CREATE INDEX "ProfileSection_orderIdx_idx" ON "public"."ProfileSection"("orderIdx");

-- CreateIndex
CREATE INDEX "ProfileLink_profileId_idx" ON "public"."ProfileLink"("profileId");

-- CreateIndex
CREATE INDEX "ProfileLink_orderIdx_idx" ON "public"."ProfileLink"("orderIdx");

-- CreateIndex
CREATE INDEX "Follow_followerId_idx" ON "public"."Follow"("followerId");

-- CreateIndex
CREATE INDEX "Follow_followeeId_idx" ON "public"."Follow"("followeeId");

-- CreateIndex
CREATE INDEX "Block_blockerId_idx" ON "public"."Block"("blockerId");

-- CreateIndex
CREATE INDEX "Block_blockedId_idx" ON "public"."Block"("blockedId");

-- CreateIndex
CREATE INDEX "Presence_status_idx" ON "public"."Presence"("status");

-- CreateIndex
CREATE INDEX "Presence_lastSeen_idx" ON "public"."Presence"("lastSeen");

-- CreateIndex
CREATE INDEX "Activity_profileId_idx" ON "public"."Activity"("profileId");

-- CreateIndex
CREATE INDEX "Activity_type_idx" ON "public"."Activity"("type");

-- CreateIndex
CREATE INDEX "Activity_visibility_idx" ON "public"."Activity"("visibility");

-- CreateIndex
CREATE INDEX "Activity_createdAt_idx" ON "public"."Activity"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_profileId_idx" ON "public"."Notification"("profileId");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "public"."Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "public"."Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "public"."Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Leaderboard_gameCode_idx" ON "public"."Leaderboard"("gameCode");

-- CreateIndex
CREATE INDEX "Leaderboard_scope_idx" ON "public"."Leaderboard"("scope");

-- CreateIndex
CREATE INDEX "Leaderboard_period_idx" ON "public"."Leaderboard"("period");

-- CreateIndex
CREATE INDEX "Leaderboard_createdAt_idx" ON "public"."Leaderboard"("createdAt");

-- CreateIndex
CREATE INDEX "Comment_contentType_contentId_idx" ON "public"."Comment"("contentType", "contentId");

-- CreateIndex
CREATE INDEX "Comment_authorId_idx" ON "public"."Comment"("authorId");

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "public"."Comment"("parentId");

-- CreateIndex
CREATE INDEX "Comment_createdAt_idx" ON "public"."Comment"("createdAt");

-- CreateIndex
CREATE INDEX "Comment_isDeleted_idx" ON "public"."Comment"("isDeleted");

-- CreateIndex
CREATE INDEX "Comment_isModerated_idx" ON "public"."Comment"("isModerated");

-- CreateIndex
CREATE INDEX "CommentLike_commentId_idx" ON "public"."CommentLike"("commentId");

-- CreateIndex
CREATE INDEX "CommentLike_userId_idx" ON "public"."CommentLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentLike_commentId_userId_key" ON "public"."CommentLike"("commentId", "userId");

-- CreateIndex
CREATE INDEX "CommentReport_commentId_idx" ON "public"."CommentReport"("commentId");

-- CreateIndex
CREATE INDEX "CommentReport_reporterId_idx" ON "public"."CommentReport"("reporterId");

-- CreateIndex
CREATE INDEX "CommentReport_status_idx" ON "public"."CommentReport"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CommentReport_commentId_reporterId_key" ON "public"."CommentReport"("commentId", "reporterId");

-- CreateIndex
CREATE INDEX "Party_leaderId_idx" ON "public"."Party"("leaderId");

-- CreateIndex
CREATE INDEX "Party_status_idx" ON "public"."Party"("status");

-- CreateIndex
CREATE INDEX "Party_gameMode_idx" ON "public"."Party"("gameMode");

-- CreateIndex
CREATE INDEX "Party_isPublic_idx" ON "public"."Party"("isPublic");

-- CreateIndex
CREATE INDEX "Party_createdAt_idx" ON "public"."Party"("createdAt");

-- CreateIndex
CREATE INDEX "PartyMember_partyId_idx" ON "public"."PartyMember"("partyId");

-- CreateIndex
CREATE INDEX "PartyMember_userId_idx" ON "public"."PartyMember"("userId");

-- CreateIndex
CREATE INDEX "PartyMember_role_idx" ON "public"."PartyMember"("role");

-- CreateIndex
CREATE UNIQUE INDEX "PartyMember_partyId_userId_key" ON "public"."PartyMember"("partyId", "userId");

-- CreateIndex
CREATE INDEX "PartyInvitation_partyId_idx" ON "public"."PartyInvitation"("partyId");

-- CreateIndex
CREATE INDEX "PartyInvitation_inviterId_idx" ON "public"."PartyInvitation"("inviterId");

-- CreateIndex
CREATE INDEX "PartyInvitation_inviteeId_idx" ON "public"."PartyInvitation"("inviteeId");

-- CreateIndex
CREATE INDEX "PartyInvitation_status_idx" ON "public"."PartyInvitation"("status");

-- CreateIndex
CREATE INDEX "PartyInvitation_expiresAt_idx" ON "public"."PartyInvitation"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PartyInvitation_partyId_inviteeId_key" ON "public"."PartyInvitation"("partyId", "inviteeId");

-- CreateIndex
CREATE INDEX "CoopSession_partyId_idx" ON "public"."CoopSession"("partyId");

-- CreateIndex
CREATE INDEX "CoopSession_gameType_idx" ON "public"."CoopSession"("gameType");

-- CreateIndex
CREATE INDEX "CoopSession_status_idx" ON "public"."CoopSession"("status");

-- CreateIndex
CREATE INDEX "CoopSession_startedAt_idx" ON "public"."CoopSession"("startedAt");

-- CreateIndex
CREATE INDEX "CoopSessionParticipant_sessionId_idx" ON "public"."CoopSessionParticipant"("sessionId");

-- CreateIndex
CREATE INDEX "CoopSessionParticipant_userId_idx" ON "public"."CoopSessionParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CoopSessionParticipant_sessionId_userId_key" ON "public"."CoopSessionParticipant"("sessionId", "userId");

-- CreateIndex
CREATE INDEX "PartyMessage_partyId_idx" ON "public"."PartyMessage"("partyId");

-- CreateIndex
CREATE INDEX "PartyMessage_authorId_idx" ON "public"."PartyMessage"("authorId");

-- CreateIndex
CREATE INDEX "PartyMessage_createdAt_idx" ON "public"."PartyMessage"("createdAt");

-- CreateIndex
CREATE INDEX "UserReport_reporterId_idx" ON "public"."UserReport"("reporterId");

-- CreateIndex
CREATE INDEX "UserReport_reportedUserId_idx" ON "public"."UserReport"("reportedUserId");

-- CreateIndex
CREATE INDEX "UserReport_contentType_idx" ON "public"."UserReport"("contentType");

-- CreateIndex
CREATE INDEX "UserReport_contentId_idx" ON "public"."UserReport"("contentId");

-- CreateIndex
CREATE INDEX "UserReport_status_idx" ON "public"."UserReport"("status");

-- CreateIndex
CREATE INDEX "UserReport_priority_idx" ON "public"."UserReport"("priority");

-- CreateIndex
CREATE INDEX "UserReport_assignedModeratorId_idx" ON "public"."UserReport"("assignedModeratorId");

-- CreateIndex
CREATE INDEX "UserReport_createdAt_idx" ON "public"."UserReport"("createdAt");

-- CreateIndex
CREATE INDEX "ModerationAction_userId_idx" ON "public"."ModerationAction"("userId");

-- CreateIndex
CREATE INDEX "ModerationAction_moderatorId_idx" ON "public"."ModerationAction"("moderatorId");

-- CreateIndex
CREATE INDEX "ModerationAction_actionType_idx" ON "public"."ModerationAction"("actionType");

-- CreateIndex
CREATE INDEX "ModerationAction_isActive_idx" ON "public"."ModerationAction"("isActive");

-- CreateIndex
CREATE INDEX "ModerationAction_expiresAt_idx" ON "public"."ModerationAction"("expiresAt");

-- CreateIndex
CREATE INDEX "ModerationAction_createdAt_idx" ON "public"."ModerationAction"("createdAt");

-- CreateIndex
CREATE INDEX "ContentModeration_contentType_idx" ON "public"."ContentModeration"("contentType");

-- CreateIndex
CREATE INDEX "ContentModeration_contentId_idx" ON "public"."ContentModeration"("contentId");

-- CreateIndex
CREATE INDEX "ContentModeration_authorId_idx" ON "public"."ContentModeration"("authorId");

-- CreateIndex
CREATE INDEX "ContentModeration_status_idx" ON "public"."ContentModeration"("status");

-- CreateIndex
CREATE INDEX "ContentModeration_automatedScore_idx" ON "public"."ContentModeration"("automatedScore");

-- CreateIndex
CREATE INDEX "ContentModeration_createdAt_idx" ON "public"."ContentModeration"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserSafetySettings_userId_key" ON "public"."UserSafetySettings"("userId");

-- CreateIndex
CREATE INDEX "ModeratorRole_userId_idx" ON "public"."ModeratorRole"("userId");

-- CreateIndex
CREATE INDEX "ModeratorRole_role_idx" ON "public"."ModeratorRole"("role");

-- CreateIndex
CREATE INDEX "ModeratorRole_isActive_idx" ON "public"."ModeratorRole"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ModeratorRole_userId_role_key" ON "public"."ModeratorRole"("userId", "role");

-- CreateIndex
CREATE INDEX "ModerationAppeal_actionId_idx" ON "public"."ModerationAppeal"("actionId");

-- CreateIndex
CREATE INDEX "ModerationAppeal_userId_idx" ON "public"."ModerationAppeal"("userId");

-- CreateIndex
CREATE INDEX "ModerationAppeal_status_idx" ON "public"."ModerationAppeal"("status");

-- CreateIndex
CREATE INDEX "ModerationAppeal_createdAt_idx" ON "public"."ModerationAppeal"("createdAt");

-- CreateIndex
CREATE INDEX "SearchHistory_userId_idx" ON "public"."SearchHistory"("userId");

-- CreateIndex
CREATE INDEX "SearchHistory_query_idx" ON "public"."SearchHistory"("query");

-- CreateIndex
CREATE INDEX "SearchHistory_searchType_idx" ON "public"."SearchHistory"("searchType");

-- CreateIndex
CREATE INDEX "SearchHistory_createdAt_idx" ON "public"."SearchHistory"("createdAt");

-- CreateIndex
CREATE INDEX "SearchSuggestion_query_idx" ON "public"."SearchSuggestion"("query");

-- CreateIndex
CREATE INDEX "SearchSuggestion_suggestionType_idx" ON "public"."SearchSuggestion"("suggestionType");

-- CreateIndex
CREATE INDEX "SearchSuggestion_popularity_idx" ON "public"."SearchSuggestion"("popularity");

-- CreateIndex
CREATE INDEX "SearchSuggestion_lastUsed_idx" ON "public"."SearchSuggestion"("lastUsed");

-- CreateIndex
CREATE UNIQUE INDEX "SearchSuggestion_query_suggestionType_targetId_key" ON "public"."SearchSuggestion"("query", "suggestionType", "targetId");

-- CreateIndex
CREATE INDEX "SearchAnalytics_query_idx" ON "public"."SearchAnalytics"("query");

-- CreateIndex
CREATE INDEX "SearchAnalytics_searchType_idx" ON "public"."SearchAnalytics"("searchType");

-- CreateIndex
CREATE INDEX "SearchAnalytics_userId_idx" ON "public"."SearchAnalytics"("userId");

-- CreateIndex
CREATE INDEX "SearchAnalytics_createdAt_idx" ON "public"."SearchAnalytics"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "public"."UserSettings"("userId");

-- CreateIndex
CREATE INDEX "UserSettings_profileVisibility_idx" ON "public"."UserSettings"("profileVisibility");

-- CreateIndex
CREATE INDEX "UserSettings_activityVisibility_idx" ON "public"."UserSettings"("activityVisibility");

-- CreateIndex
CREATE UNIQUE INDEX "PrivacySettings_userId_key" ON "public"."PrivacySettings"("userId");

-- CreateIndex
CREATE INDEX "GameSettings_gameCode_idx" ON "public"."GameSettings"("gameCode");

-- CreateIndex
CREATE UNIQUE INDEX "GameSettings_userId_gameCode_key" ON "public"."GameSettings"("userId", "gameCode");

-- CreateIndex
CREATE INDEX "LeaderboardScore_boardId_idx" ON "public"."LeaderboardScore"("boardId");

-- CreateIndex
CREATE INDEX "LeaderboardScore_profileId_idx" ON "public"."LeaderboardScore"("profileId");

-- CreateIndex
CREATE INDEX "LeaderboardScore_rank_idx" ON "public"."LeaderboardScore"("rank");

-- CreateIndex
CREATE UNIQUE INDEX "Product_integration_ref_key" ON "public"."Product"("integration_ref");

-- CreateIndex
CREATE INDEX "Product_category_slug_idx" ON "public"."Product"("category_slug");

-- CreateIndex
CREATE INDEX "Product_integration_ref_idx" ON "public"."Product"("integration_ref");

-- CreateIndex
CREATE INDEX "Product_active_category_slug_idx" ON "public"."Product"("active", "category_slug");

-- AddForeignKey
ALTER TABLE "public"."LeaderboardScore" ADD CONSTRAINT "LeaderboardScore_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "public"."Leaderboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeaderboardScore" ADD CONSTRAINT "LeaderboardScore_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CharacterConfig" ADD CONSTRAINT "CharacterConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CharacterReaction" ADD CONSTRAINT "CharacterReaction_characterConfigId_fkey" FOREIGN KEY ("characterConfigId") REFERENCES "public"."CharacterConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCharacterPreset" ADD CONSTRAINT "UserCharacterPreset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCharacterPreset" ADD CONSTRAINT "UserCharacterPreset_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "public"."CharacterPreset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProfileSection" ADD CONSTRAINT "ProfileSection_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProfileLink" ADD CONSTRAINT "ProfileLink_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProfileTheme" ADD CONSTRAINT "ProfileTheme_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Follow" ADD CONSTRAINT "Follow_followeeId_fkey" FOREIGN KEY ("followeeId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Block" ADD CONSTRAINT "Block_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Block" ADD CONSTRAINT "Block_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Presence" ADD CONSTRAINT "Presence_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentLike" ADD CONSTRAINT "CommentLike_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "public"."Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentLike" ADD CONSTRAINT "CommentLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentReport" ADD CONSTRAINT "CommentReport_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "public"."Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentReport" ADD CONSTRAINT "CommentReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentReport" ADD CONSTRAINT "CommentReport_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Party" ADD CONSTRAINT "Party_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PartyMember" ADD CONSTRAINT "PartyMember_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "public"."Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PartyMember" ADD CONSTRAINT "PartyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PartyInvitation" ADD CONSTRAINT "PartyInvitation_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "public"."Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PartyInvitation" ADD CONSTRAINT "PartyInvitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PartyInvitation" ADD CONSTRAINT "PartyInvitation_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CoopSession" ADD CONSTRAINT "CoopSession_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "public"."Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CoopSessionParticipant" ADD CONSTRAINT "CoopSessionParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."CoopSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CoopSessionParticipant" ADD CONSTRAINT "CoopSessionParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PartyMessage" ADD CONSTRAINT "PartyMessage_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "public"."Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PartyMessage" ADD CONSTRAINT "PartyMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserReport" ADD CONSTRAINT "UserReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserReport" ADD CONSTRAINT "UserReport_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserReport" ADD CONSTRAINT "UserReport_assignedModeratorId_fkey" FOREIGN KEY ("assignedModeratorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ModerationAction" ADD CONSTRAINT "ModerationAction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ModerationAction" ADD CONSTRAINT "ModerationAction_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ModerationAction" ADD CONSTRAINT "ModerationAction_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."UserReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentModeration" ADD CONSTRAINT "ContentModeration_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentModeration" ADD CONSTRAINT "ContentModeration_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserSafetySettings" ADD CONSTRAINT "UserSafetySettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ModeratorRole" ADD CONSTRAINT "ModeratorRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ModeratorRole" ADD CONSTRAINT "ModeratorRole_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ModerationAppeal" ADD CONSTRAINT "ModerationAppeal_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "public"."ModerationAction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ModerationAppeal" ADD CONSTRAINT "ModerationAppeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ModerationAppeal" ADD CONSTRAINT "ModerationAppeal_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SearchHistory" ADD CONSTRAINT "SearchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SearchAnalytics" ADD CONSTRAINT "SearchAnalytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrivacySettings" ADD CONSTRAINT "PrivacySettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameSettings" ADD CONSTRAINT "GameSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
