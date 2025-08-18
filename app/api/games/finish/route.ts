export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GAME_FLAGS } from "@/config/games";
import type { LeaderboardScore } from "@prisma/client";

type Body = {
  game: string;
  score: number;
  durationMs?: number;
  stats?: any;            // e.g., { diff?: "easy"|"normal"|"hard"|"insane", ... }
};

const MAX_TOP = 25;

export async function POST(req: Request) {
  const { userId } = auth();
  const body = (await req.json().catch(()=>null)) as Body | null;
  if (!body?.game || typeof body.score !== "number") {
    return NextResponse.json({ ok:false, error:"bad_input" }, { status:400 });
  }

  // clamp score defensively
  const score = Math.max(0, Math.min(body.score|0, 10_000_000));
  const game = String(body.game);
  const diff = typeof body.stats?.diff === "string" ? body.stats.diff : null;

  // Check game flags
  const flags = GAME_FLAGS[game as keyof typeof GAME_FLAGS];
  if (!flags?.enabled) {
    return NextResponse.json({ ok:false, error:"game_disabled" }, { status:400 });
  }
  if (flags.practice) {
    // Practice mode: don't grant petals/achievements/leaderboard
    return NextResponse.json({ ok:true, practice:true });
  }

  // Guest users can play but won't get economy rewards
  if (!userId) {
    return NextResponse.json({ ok:true, guest:true });
  }

  // TODO: you already grant petals/achievements here; keep that logic

  // Save personal best (if authed)
  let newPersonalBest = false;
  if (userId) {
    try {
      const prev = await prisma.leaderboardScore.findUnique({
        where: { userId_game_diff: { userId, game, diff } }
      });
      if (!prev || score > prev.score) {
        await prisma.leaderboardScore.upsert({
          where: { userId_game_diff: { userId, game, diff } },
          create: { userId, game, diff, score, statsJson: body.stats ?? {} },
          update: { score, statsJson: body.stats ?? {} }
        });
        newPersonalBest = true;
      }
    } catch (e) {
      console.error("leaderboard upsert error", e);
    }
  }

  // Top board slice (public)
  const top = await prisma.leaderboardScore.findMany({
    where: { game, ...(diff ? { diff } : {}) },
    orderBy: [{ score: "desc" }, { updatedAt: "asc" }],
    take: MAX_TOP
  });

  return NextResponse.json({
    ok: true,
    score,
    personalBest: newPersonalBest,
    top: top.map((t: LeaderboardScore)=>({
      userId: t.userId,
      score: t.score,
      diff: t.diff,
      when: t.updatedAt
    }))
  });
}
