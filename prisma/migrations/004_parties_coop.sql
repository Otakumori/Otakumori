-- Parties & Coop Hooks Migration
-- Forward-compatible scaffolding for future cooperative features

-- Party system for group activities
CREATE TABLE "Party" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "leaderId" TEXT NOT NULL,
    "maxMembers" INTEGER NOT NULL DEFAULT 4,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "gameMode" TEXT, -- 'mini-games', 'exploration', 'social', 'custom'
    "status" TEXT NOT NULL DEFAULT 'open', -- 'open', 'full', 'in-game', 'closed'
    "settings" JSONB, -- Party-specific settings and preferences
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- Party members with roles and permissions
CREATE TABLE "PartyMember" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member', -- 'leader', 'moderator', 'member'
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "permissions" JSONB, -- Role-specific permissions

    CONSTRAINT "PartyMember_pkey" PRIMARY KEY ("id")
);

-- Party invitations system
CREATE TABLE "PartyInvitation" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "inviteeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'expired'
    "message" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "PartyInvitation_pkey" PRIMARY KEY ("id")
);

-- Coop session tracking
CREATE TABLE "CoopSession" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "gameType" TEXT NOT NULL, -- 'mini-game', 'exploration', 'social'
    "gameId" TEXT, -- Specific game or activity ID
    "status" TEXT NOT NULL DEFAULT 'active', -- 'active', 'paused', 'completed', 'abandoned'
    "settings" JSONB, -- Game-specific settings
    "progress" JSONB, -- Session progress and state
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoopSession_pkey" PRIMARY KEY ("id")
);

-- Coop session participants
CREATE TABLE "CoopSessionParticipant" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'player', -- 'player', 'spectator', 'moderator'
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "stats" JSONB, -- Session-specific statistics

    CONSTRAINT "CoopSessionParticipant_pkey" PRIMARY KEY ("id")
);

-- Party chat messages (minimal for now)
CREATE TABLE "PartyMessage" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'text', -- 'text', 'system', 'game_event'
    "metadata" JSONB, -- Additional message data
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartyMessage_pkey" PRIMARY KEY ("id")
);

-- Create indexes for performance
CREATE INDEX "Party_leaderId_idx" ON "Party"("leaderId");
CREATE INDEX "Party_status_idx" ON "Party"("status");
CREATE INDEX "Party_gameMode_idx" ON "Party"("gameMode");
CREATE INDEX "Party_isPublic_idx" ON "Party"("isPublic");
CREATE INDEX "Party_createdAt_idx" ON "Party"("createdAt");

CREATE INDEX "PartyMember_partyId_idx" ON "PartyMember"("partyId");
CREATE INDEX "PartyMember_userId_idx" ON "PartyMember"("userId");
CREATE INDEX "PartyMember_role_idx" ON "PartyMember"("role");

CREATE INDEX "PartyInvitation_partyId_idx" ON "PartyInvitation"("partyId");
CREATE INDEX "PartyInvitation_inviterId_idx" ON "PartyInvitation"("inviterId");
CREATE INDEX "PartyInvitation_inviteeId_idx" ON "PartyInvitation"("inviteeId");
CREATE INDEX "PartyInvitation_status_idx" ON "PartyInvitation"("status");
CREATE INDEX "PartyInvitation_expiresAt_idx" ON "PartyInvitation"("expiresAt");

CREATE INDEX "CoopSession_partyId_idx" ON "CoopSession"("partyId");
CREATE INDEX "CoopSession_gameType_idx" ON "CoopSession"("gameType");
CREATE INDEX "CoopSession_status_idx" ON "CoopSession"("status");
CREATE INDEX "CoopSession_startedAt_idx" ON "CoopSession"("startedAt");

CREATE INDEX "CoopSessionParticipant_sessionId_idx" ON "CoopSessionParticipant"("sessionId");
CREATE INDEX "CoopSessionParticipant_userId_idx" ON "CoopSessionParticipant"("userId");

CREATE INDEX "PartyMessage_partyId_idx" ON "PartyMessage"("partyId");
CREATE INDEX "PartyMessage_authorId_idx" ON "PartyMessage"("authorId");
CREATE INDEX "PartyMessage_createdAt_idx" ON "PartyMessage"("createdAt");

-- Add foreign key constraints
ALTER TABLE "Party" ADD CONSTRAINT "Party_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PartyMember" ADD CONSTRAINT "PartyMember_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PartyMember" ADD CONSTRAINT "PartyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PartyInvitation" ADD CONSTRAINT "PartyInvitation_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PartyInvitation" ADD CONSTRAINT "PartyInvitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PartyInvitation" ADD CONSTRAINT "PartyInvitation_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CoopSession" ADD CONSTRAINT "CoopSession_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CoopSessionParticipant" ADD CONSTRAINT "CoopSessionParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CoopSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CoopSessionParticipant" ADD CONSTRAINT "CoopSessionParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PartyMessage" ADD CONSTRAINT "PartyMessage_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PartyMessage" ADD CONSTRAINT "PartyMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add unique constraints
ALTER TABLE "PartyMember" ADD CONSTRAINT "PartyMember_partyId_userId_unique" UNIQUE ("partyId", "userId");
ALTER TABLE "PartyInvitation" ADD CONSTRAINT "PartyInvitation_partyId_inviteeId_unique" UNIQUE ("partyId", "inviteeId");
ALTER TABLE "CoopSessionParticipant" ADD CONSTRAINT "CoopSessionParticipant_sessionId_userId_unique" UNIQUE ("sessionId", "userId");
