-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "isNSFW" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "nsfwAffirmationVer" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "nsfwAffirmedAt" TIMESTAMP(3),
ADD COLUMN     "nsfwEnabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "public"."UserFile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserTitle" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTitle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserFile_key_key" ON "public"."UserFile"("key");

-- CreateIndex
CREATE INDEX "UserFile_userId_idx" ON "public"."UserFile"("userId");

-- CreateIndex
CREATE INDEX "UserFile_userId_createdAt_idx" ON "public"."UserFile"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "UserTitle_userId_idx" ON "public"."UserTitle"("userId");

-- CreateIndex
CREATE INDEX "UserTitle_userId_awardedAt_idx" ON "public"."UserTitle"("userId", "awardedAt");

-- AddForeignKey
ALTER TABLE "public"."UserFile" ADD CONSTRAINT "UserFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserTitle" ADD CONSTRAINT "UserTitle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
