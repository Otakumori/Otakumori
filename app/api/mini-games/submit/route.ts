import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { rateLimit } from "@/app/api/rate-limit";
import { logger } from "@/app/lib/logger";
import { db } from "@/lib/db";
import { problem } from "@/lib/http/problem";
import { reqId } from "@/lib/log";
import { creditPetals } from "@/lib/petals";
import { submitScoreReq } from "@/lib/schemas/minigames";

export const runtime = "nodejs";
export const maxDuration = 10;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function calcAward(game: string, score: number): number {
  switch (game) {
    case "petal-run":
      return clamp(Math.floor(score / 10), 0, 50);
    case "memory":
      return clamp(Math.floor(score / 20), 0, 30);
    case "rhythm":
      return clamp(Math.floor(score / 12), 0, 60);
    default:
      return 0;
  }
}

export async function POST(req: NextRequest) {
  const requestId = reqId(req.headers);
  logger.request(req, "POST /api/mini-games/submit");

  const { userId } = await auth();

  let payload: unknown;
  try {
    payload = await req.json();
  } catch (error) {
    logger.error("mini-game submit JSON parse failed", { requestId }, { error });
    return NextResponse.json(problem(400, "Invalid request"), { status: 400 });
  }

  const parsed = submitScoreReq.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(problem(400, "Invalid request"), { status: 400 });
  }

  const { score, game } = parsed.data;

  if (!userId) {
    await upsertLeaderboardScore({ userId: "guest", game, score, requestId: requestId || undefined });
    return NextResponse.json({ ok: true, score, petalsGranted: 0 });
  }

  const limit = await rateLimit(
    req,
    { windowMs: 60_000, maxRequests: 6, keyPrefix: "mg:submit" },
    `${userId}:${game}`,
  );

  if (limit.limited) {
    return NextResponse.json(problem(429, "Rate limit exceeded"), { status: 429 });
  }

  await upsertLeaderboardScore({ userId, game, score, requestId: requestId || undefined });

  let petalsGranted = calcAward(game, score);
  let balance: number | undefined;

  if (petalsGranted > 0) {
    try {
      const result = await creditPetals(userId, petalsGranted, "mini-game-reward");
      balance = result.balance;
    } catch (error) {
      logger.error("petals_award_error", { requestId: requestId || undefined, userId, game }, { error });
      petalsGranted = 0;
    }
  }

  return NextResponse.json({
    ok: true,
    score,
    petalsGranted,
    ...(balance !== undefined ? { balance } : {}),
    requestId,
  });
}

async function upsertLeaderboardScore({
  userId,
  game,
  score,
  requestId,
}: {
  userId: string;
  game: string;
  score: number;
  requestId?: string;
}) {
  try {
    const previous = await db.leaderboardScore.findFirst({
      where: { userId, game, diff: null },
      select: { id: true, score: true },
    });

    if (!previous) {
      await db.leaderboardScore.create({
        data: { userId, game, diff: null, score, statsJson: {} },
      });
      return;
    }

    if (score > previous.score) {
      await db.leaderboardScore.update({
        where: { id: previous.id },
        data: { score },
      });
    }
  } catch (error) {
    logger.error("leaderboard_upsert_error", { requestId, userId, game }, { error });
  }
}