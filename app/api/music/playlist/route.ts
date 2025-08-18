import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  // For now: serve the newest public playlist
  const pl = await prisma.musicPlaylist.findFirst({
    where: { isPublic: true },
    orderBy: { createdAt: "desc" },
    include: { tracks: { orderBy: { sort: "asc" } } },
  });

  return NextResponse.json({ ok: true, playlist: pl ?? null });
}
