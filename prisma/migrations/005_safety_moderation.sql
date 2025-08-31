-- Safety, Reporting & Moderation System Migration
-- Comprehensive moderation tools for community safety

-- User reports for various content types
CREATE TABLE "UserReport" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reportedUserId" TEXT,
    "contentType" TEXT NOT NULL, -- 'user', 'comment', 'party', 'party_message', 'activity'
    "contentId" TEXT, -- ID of the reported content
    "reason" TEXT NOT NULL, -- 'spam', 'harassment', 'inappropriate', 'fake', 'underage', 'other'
    "description" TEXT,
    "evidence" JSONB, -- Screenshots, links, additional context
    "status" TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
    "priority" TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    "assignedModeratorId" TEXT,
    "moderatorNotes" TEXT,
    "resolution" TEXT, -- 'warning', 'content_removed', 'user_suspended', 'user_banned', 'no_action'
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "UserReport_pkey" PRIMARY KEY ("id")
);

-- Moderation actions taken against users
CREATE TABLE "ModerationAction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL, -- 'warning', 'content_removed', 'suspension', 'ban', 'restriction'
    "reason" TEXT NOT NULL,
    "details" JSONB, -- Action-specific details (duration, scope, etc.)
    "reportId" TEXT, -- Link to the report that triggered this action
    "expiresAt" TIMESTAMP(3), -- For temporary actions
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appealedAt" TIMESTAMP(3),
    "appealStatus" TEXT DEFAULT 'none', -- 'none', 'pending', 'approved', 'denied'

    CONSTRAINT "ModerationAction_pkey" PRIMARY KEY ("id")
);

-- Content moderation queue for automated and manual review
CREATE TABLE "ContentModeration" (
    "id" TEXT NOT NULL,
    "contentType" TEXT NOT NULL, -- 'comment', 'party_message', 'profile_bio', 'activity'
    "contentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'flagged'
    "automatedScore" DECIMAL(3,2), -- AI/automated moderation score (0.00-1.00)
    "moderatorId" TEXT,
    "moderatorNotes" TEXT,
    "flags" JSONB, -- Automated flags (profanity, spam, etc.)
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "ContentModeration_pkey" PRIMARY KEY ("id")
);

-- User safety settings and preferences
CREATE TABLE "UserSafetySettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "allowFriendRequests" BOOLEAN NOT NULL DEFAULT true,
    "allowPartyInvites" BOOLEAN NOT NULL DEFAULT true,
    "allowMessages" BOOLEAN NOT NULL DEFAULT true,
    "blockedUsers" TEXT[], -- Array of blocked user IDs
    "contentFilter" TEXT NOT NULL DEFAULT 'moderate', -- 'strict', 'moderate', 'lenient'
    "reportNotifications" BOOLEAN NOT NULL DEFAULT true,
    "moderationNotifications" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSafetySettings_pkey" PRIMARY KEY ("id")
);

-- Moderation team and permissions
CREATE TABLE "ModeratorRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL, -- 'moderator', 'senior_moderator', 'admin'
    "permissions" JSONB NOT NULL, -- Specific permissions for this role
    "assignedBy" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3), -- For temporary moderator roles

    CONSTRAINT "ModeratorRole_pkey" PRIMARY KEY ("id")
);

-- Appeal system for moderation actions
CREATE TABLE "ModerationAppeal" (
    "id" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "evidence" JSONB, -- Additional evidence for the appeal
    "status" TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'under_review', 'approved', 'denied'
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "ModerationAppeal_pkey" PRIMARY KEY ("id")
);

-- Create indexes for performance
CREATE INDEX "UserReport_reporterId_idx" ON "UserReport"("reporterId");
CREATE INDEX "UserReport_reportedUserId_idx" ON "UserReport"("reportedUserId");
CREATE INDEX "UserReport_contentType_idx" ON "UserReport"("contentType");
CREATE INDEX "UserReport_contentId_idx" ON "UserReport"("contentId");
CREATE INDEX "UserReport_status_idx" ON "UserReport"("status");
CREATE INDEX "UserReport_priority_idx" ON "UserReport"("priority");
CREATE INDEX "UserReport_assignedModeratorId_idx" ON "UserReport"("assignedModeratorId");
CREATE INDEX "UserReport_createdAt_idx" ON "UserReport"("createdAt");

CREATE INDEX "ModerationAction_userId_idx" ON "ModerationAction"("userId");
CREATE INDEX "ModerationAction_moderatorId_idx" ON "ModerationAction"("moderatorId");
CREATE INDEX "ModerationAction_actionType_idx" ON "ModerationAction"("actionType");
CREATE INDEX "ModerationAction_isActive_idx" ON "ModerationAction"("isActive");
CREATE INDEX "ModerationAction_expiresAt_idx" ON "ModerationAction"("expiresAt");
CREATE INDEX "ModerationAction_createdAt_idx" ON "ModerationAction"("createdAt");

CREATE INDEX "ContentModeration_contentType_idx" ON "ContentModeration"("contentType");
CREATE INDEX "ContentModeration_contentId_idx" ON "ContentModeration"("contentId");
CREATE INDEX "ContentModeration_authorId_idx" ON "ContentModeration"("authorId");
CREATE INDEX "ContentModeration_status_idx" ON "ContentModeration"("status");
CREATE INDEX "ContentModeration_automatedScore_idx" ON "ContentModeration"("automatedScore");
CREATE INDEX "ContentModeration_createdAt_idx" ON "ContentModeration"("createdAt");

CREATE INDEX "UserSafetySettings_userId_idx" ON "UserSafetySettings"("userId");

CREATE INDEX "ModeratorRole_userId_idx" ON "ModeratorRole"("userId");
CREATE INDEX "ModeratorRole_role_idx" ON "ModeratorRole"("role");
CREATE INDEX "ModeratorRole_isActive_idx" ON "ModeratorRole"("isActive");

CREATE INDEX "ModerationAppeal_actionId_idx" ON "ModerationAppeal"("actionId");
CREATE INDEX "ModerationAppeal_userId_idx" ON "ModerationAppeal"("userId");
CREATE INDEX "ModerationAppeal_status_idx" ON "ModerationAppeal"("status");
CREATE INDEX "ModerationAppeal_createdAt_idx" ON "ModerationAppeal"("createdAt");

-- Add foreign key constraints
ALTER TABLE "UserReport" ADD CONSTRAINT "UserReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserReport" ADD CONSTRAINT "UserReport_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UserReport" ADD CONSTRAINT "UserReport_assignedModeratorId_fkey" FOREIGN KEY ("assignedModeratorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ModerationAction" ADD CONSTRAINT "ModerationAction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ModerationAction" ADD CONSTRAINT "ModerationAction_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ModerationAction" ADD CONSTRAINT "ModerationAction_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "UserReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ContentModeration" ADD CONSTRAINT "ContentModeration_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentModeration" ADD CONSTRAINT "ContentModeration_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "UserSafetySettings" ADD CONSTRAINT "UserSafetySettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ModeratorRole" ADD CONSTRAINT "ModeratorRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ModeratorRole" ADD CONSTRAINT "ModeratorRole_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ModerationAppeal" ADD CONSTRAINT "ModerationAppeal_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "ModerationAction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ModerationAppeal" ADD CONSTRAINT "ModerationAppeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ModerationAppeal" ADD CONSTRAINT "ModerationAppeal_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add unique constraints
ALTER TABLE "UserSafetySettings" ADD CONSTRAINT "UserSafetySettings_userId_unique" UNIQUE ("userId");
ALTER TABLE "ModeratorRole" ADD CONSTRAINT "ModeratorRole_userId_role_unique" UNIQUE ("userId", "role");
