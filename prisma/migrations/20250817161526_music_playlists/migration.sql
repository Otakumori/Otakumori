-- CreateTable
CREATE TABLE "public"."MusicPlaylist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MusicPlaylist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MusicTrack" (
    "id" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sort" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MusicTrack_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MusicTrack_playlistId_sort_idx" ON "public"."MusicTrack"("playlistId", "sort");

-- AddForeignKey
ALTER TABLE "public"."MusicTrack" ADD CONSTRAINT "MusicTrack_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "public"."MusicPlaylist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
