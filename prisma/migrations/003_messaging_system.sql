-- Messaging System Migration
-- Minimal comments system with moderation and safety features

-- Comments table for various content types
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "parentId" TEXT, -- For nested replies
    "contentType" TEXT NOT NULL, -- 'profile', 'achievement', 'leaderboard', 'activity'
    "contentId" TEXT NOT NULL, -- ID of the content being commented on
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isModerated" BOOLEAN NOT NULL DEFAULT false,
    "moderationReason" TEXT,
    "likeCount" INT NOT NULL DEFAULT 0,
    "replyCount" INT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- Comment likes/reactions
CREATE TABLE "CommentLike" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentLike_pkey" PRIMARY KEY ("id")
);

-- Comment reports for moderation
CREATE TABLE "CommentReport" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reason" TEXT NOT NULL, -- 'spam', 'harassment', 'inappropriate', 'other'
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
    "moderatorId" TEXT,
    "moderatorNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "CommentReport_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "Comment_contentType_contentId_idx" ON "Comment"("contentType", "contentId");
CREATE INDEX "Comment_authorId_idx" ON "Comment"("authorId");
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");
CREATE INDEX "Comment_createdAt_idx" ON "Comment"("createdAt");
CREATE INDEX "Comment_isDeleted_idx" ON "Comment"("isDeleted");
CREATE INDEX "Comment_isModerated_idx" ON "Comment"("isModerated");

CREATE INDEX "CommentLike_commentId_idx" ON "CommentLike"("commentId");
CREATE INDEX "CommentLike_userId_idx" ON "CommentLike"("userId");

CREATE INDEX "CommentReport_commentId_idx" ON "CommentReport"("commentId");
CREATE INDEX "CommentReport_reporterId_idx" ON "CommentReport"("reporterId");
CREATE INDEX "CommentReport_status_idx" ON "CommentReport"("status");

-- Add foreign key constraints
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CommentLike" ADD CONSTRAINT "CommentLike_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommentLike" ADD CONSTRAINT "CommentLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CommentReport" ADD CONSTRAINT "CommentReport_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommentReport" ADD CONSTRAINT "CommentReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommentReport" ADD CONSTRAINT "CommentReport_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add unique constraints
CREATE UNIQUE INDEX "CommentLike_commentId_userId_unique" ON "CommentLike"("commentId", "userId");
CREATE UNIQUE INDEX "CommentReport_commentId_reporterId_unique" ON "CommentReport"("commentId", "reporterId");
