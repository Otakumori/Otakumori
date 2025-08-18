-- CreateTable
CREATE TABLE "public"."Quest" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "basePetals" INTEGER NOT NULL DEFAULT 20,
    "bonusPetals" INTEGER NOT NULL DEFAULT 10,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Quest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuestAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "target" INTEGER NOT NULL DEFAULT 1,
    "completedAt" TIMESTAMP(3),
    "claimedAt" TIMESTAMP(3),
    "bonusEligible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "QuestAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StreakShard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StreakShard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Quest_key_key" ON "public"."Quest"("key");

-- CreateIndex
CREATE INDEX "QuestAssignment_userId_day_idx" ON "public"."QuestAssignment"("userId", "day");

-- CreateIndex
CREATE INDEX "QuestAssignment_questId_day_idx" ON "public"."QuestAssignment"("questId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "QuestAssignment_userId_questId_day_key" ON "public"."QuestAssignment"("userId", "questId", "day");

-- CreateIndex
CREATE INDEX "StreakShard_userId_day_idx" ON "public"."StreakShard"("userId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "StreakShard_userId_day_key" ON "public"."StreakShard"("userId", "day");

-- AddForeignKey
ALTER TABLE "public"."QuestAssignment" ADD CONSTRAINT "QuestAssignment_questId_fkey" FOREIGN KEY ("questId") REFERENCES "public"."Quest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuestAssignment" ADD CONSTRAINT "QuestAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StreakShard" ADD CONSTRAINT "StreakShard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
