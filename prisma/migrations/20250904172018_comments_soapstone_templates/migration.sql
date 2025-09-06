-- CreateEnum
CREATE TYPE "public"."CommentKind" AS ENUM ('SOAPSTONE', 'TEXT', 'HYBRID');

-- CreateEnum
CREATE TYPE "public"."CommentStatus" AS ENUM ('ACTIVE', 'HIDDEN', 'SHADOWBANNED', 'DELETED');

-- CreateEnum
CREATE TYPE "public"."AppraisalValue" AS ENUM ('GOOD', 'POOR');

-- CreateEnum
CREATE TYPE "public"."PhraseCategory" AS ENUM ('TIP', 'SUBJECT', 'ACTION', 'DIRECTION', 'OBJECT', 'QUALITY', 'CONJUNCTION', 'EMOTE', 'ELEMENT', 'ATTACK_TYPE', 'PLACE', 'TIME', 'MEME', 'HUMOR');

-- CreateTable
CREATE TABLE "public"."Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommentMark" (
    "id" TEXT NOT NULL,
    "postId" TEXT,
    "parentId" TEXT,
    "authorId" TEXT NOT NULL,
    "kind" "public"."CommentKind" NOT NULL,
    "text" VARCHAR(180),
    "goodCount" INTEGER NOT NULL DEFAULT 0,
    "poorCount" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" "public"."CommentStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommentMark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommentFragment" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "phraseId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "CommentFragment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Phrase" (
    "id" TEXT NOT NULL,
    "category" "public"."PhraseCategory" NOT NULL,
    "text" TEXT NOT NULL,
    "locale" TEXT DEFAULT 'en',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Phrase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Appraisal" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "value" "public"."AppraisalValue" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appraisal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommentModeration" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "moderatorId" TEXT,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentModeration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MessageTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MessageTemplateSlot" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "optional" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MessageTemplateSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SlotAccepts" (
    "id" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "category" "public"."PhraseCategory" NOT NULL,

    CONSTRAINT "SlotAccepts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "public"."Post"("slug");

-- CreateIndex
CREATE INDEX "CommentMark_postId_status_createdAt_idx" ON "public"."CommentMark"("postId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "CommentMark_authorId_createdAt_idx" ON "public"."CommentMark"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "CommentMark_parentId_idx" ON "public"."CommentMark"("parentId");

-- CreateIndex
CREATE INDEX "CommentFragment_phraseId_idx" ON "public"."CommentFragment"("phraseId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentFragment_commentId_position_key" ON "public"."CommentFragment"("commentId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Phrase_category_text_locale_key" ON "public"."Phrase"("category", "text", "locale");

-- CreateIndex
CREATE INDEX "Appraisal_voterId_idx" ON "public"."Appraisal"("voterId");

-- CreateIndex
CREATE UNIQUE INDEX "Appraisal_commentId_voterId_key" ON "public"."Appraisal"("commentId", "voterId");

-- CreateIndex
CREATE INDEX "CommentModeration_commentId_createdAt_idx" ON "public"."CommentModeration"("commentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MessageTemplate_name_key" ON "public"."MessageTemplate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MessageTemplateSlot_templateId_position_key" ON "public"."MessageTemplateSlot"("templateId", "position");

-- CreateIndex
CREATE INDEX "SlotAccepts_category_idx" ON "public"."SlotAccepts"("category");

-- CreateIndex
CREATE UNIQUE INDEX "SlotAccepts_slotId_category_key" ON "public"."SlotAccepts"("slotId", "category");

-- AddForeignKey
ALTER TABLE "public"."CommentMark" ADD CONSTRAINT "CommentMark_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentMark" ADD CONSTRAINT "CommentMark_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."CommentMark"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentMark" ADD CONSTRAINT "CommentMark_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentFragment" ADD CONSTRAINT "CommentFragment_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "public"."CommentMark"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentFragment" ADD CONSTRAINT "CommentFragment_phraseId_fkey" FOREIGN KEY ("phraseId") REFERENCES "public"."Phrase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Appraisal" ADD CONSTRAINT "Appraisal_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "public"."CommentMark"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Appraisal" ADD CONSTRAINT "Appraisal_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentModeration" ADD CONSTRAINT "CommentModeration_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "public"."CommentMark"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentModeration" ADD CONSTRAINT "CommentModeration_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MessageTemplateSlot" ADD CONSTRAINT "MessageTemplateSlot_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."MessageTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SlotAccepts" ADD CONSTRAINT "SlotAccepts_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "public"."MessageTemplateSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
