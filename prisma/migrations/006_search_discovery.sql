-- Search & Discovery System
-- Migration: 006_search_discovery.sql

-- Search history tracking
CREATE TABLE "SearchHistory" (
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

-- Search suggestions and autocomplete
CREATE TABLE "SearchSuggestion" (
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

-- Search analytics for improving search quality
CREATE TABLE "SearchAnalytics" (
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

-- Create indexes for search performance
CREATE INDEX "SearchHistory_userId_idx" ON "SearchHistory"("userId");
CREATE INDEX "SearchHistory_query_idx" ON "SearchHistory"("query");
CREATE INDEX "SearchHistory_searchType_idx" ON "SearchHistory"("searchType");
CREATE INDEX "SearchHistory_createdAt_idx" ON "SearchHistory"("createdAt");

CREATE INDEX "SearchSuggestion_query_idx" ON "SearchSuggestion"("query");
CREATE INDEX "SearchSuggestion_suggestionType_idx" ON "SearchSuggestion"("suggestionType");
CREATE INDEX "SearchSuggestion_popularity_idx" ON "SearchSuggestion"("popularity");
CREATE INDEX "SearchSuggestion_lastUsed_idx" ON "SearchSuggestion"("lastUsed");

CREATE INDEX "SearchAnalytics_query_idx" ON "SearchAnalytics"("query");
CREATE INDEX "SearchAnalytics_searchType_idx" ON "SearchAnalytics"("searchType");
CREATE INDEX "SearchAnalytics_userId_idx" ON "SearchAnalytics"("userId");
CREATE INDEX "SearchAnalytics_createdAt_idx" ON "SearchAnalytics"("createdAt");

-- Add foreign key constraints
ALTER TABLE "SearchHistory" ADD CONSTRAINT "SearchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SearchAnalytics" ADD CONSTRAINT "SearchAnalytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create unique constraints
CREATE UNIQUE INDEX "SearchSuggestion_query_suggestionType_targetId_key" ON "SearchSuggestion"("query", "suggestionType", "targetId");
