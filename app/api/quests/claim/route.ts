import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { awardStreakShardIfEligible, userDayNY } from "@/app/lib/quests/server";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";

const ClaimRequestSchema = z.object({
  assignmentId: z.string().min(1),
});

const DAILY_CAP = 120;
const CAP_TTL_SECONDS = 60 * 60 * 24 * 2;

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "auth" }, { status: 401 });
    }

    const body = ClaimRequestSchema.parse(await request.json());

    const assignment = await db.questAssignment.findUnique({
      where: { id: body.assignmentId },
      include: { quest: true },
    });

    if (!assignment) {
      return NextResponse.json({ error: "notfound" }, { status: 404 });
    }

    const user = await db.user.findUnique({
      where: { clerkId },
      select: { id: true, petalBalance: true },
    });

    if (!user) {
      return NextResponse.json({ error: "notfound" }, { status: 404 });
    }

    if (assignment.userId !== user.id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    if (!assignment.completedAt) {
      return NextResponse.json({ error: "incomplete" }, { status: 400 });
    }

    if (assignment.claimedAt) {
      return NextResponse.json({ ok: true, already: true, message: "Already claimed" });
    }

    const quest = assignment.quest;
    if (!quest) {
      return NextResponse.json({ error: "quest_not_found" }, { status: 404 });
    }

    const day = assignment.day ?? userDayNY();
    const dailyCapKey = `petals:cap:${user.id}:${day}`;

    let usedToday = 0;
    try {
      const current = await redis.get<number>(dailyCapKey);
      if (typeof current === "number") {
        usedToday = current;
      }
    } catch (error) {
      console.warn("Redis get failed", error);
    }

    const baseReward = quest.basePetals ?? 0;
    const bonusReward = assignment.bonusEligible ? quest.bonusPetals ?? 0 : 0;
    const totalReward = baseReward + bonusReward;

    const availableToday = Math.max(0, DAILY_CAP - usedToday);
    const actualReward = Math.min(totalReward, availableToday);

    await db.$transaction(async (tx) => {
      await tx.questAssignment.update({
        where: { id: assignment.id },
        data: { claimedAt: new Date() },
      });

      if (actualReward > 0) {
        await tx.user.update({
          where: { id: user.id },
          data: { petalBalance: { increment: actualReward } },
        });

        await tx.petalLedger.create({
          data: {
            userId: user.id,
            type: "earn",
            amount: actualReward,
            reason: `quest:${quest.key}`,
          },
        });
      }
    });

    if (actualReward > 0) {
      try {
        await redis.set(dailyCapKey, usedToday + actualReward, {
          ex: CAP_TTL_SECONDS,
        });
      } catch (error) {
        console.warn("Redis set failed", error);
      }
    }

    const streakShardAwarded = await awardStreakShardIfEligible(user.id, day);

    const updatedUser = await db.user.findUnique({
      where: { id: user.id },
      select: { petalBalance: true },
    });

    return NextResponse.json({
      ok: true,
      petalsGranted: actualReward,
      totalReward,
      capped: actualReward < totalReward,
      dailyCapUsed: usedToday + actualReward,
      dailyCapRemaining: Math.max(0, DAILY_CAP - (usedToday + actualReward)),
      streakShardAwarded,
      newBalance: updatedUser?.petalBalance ?? user.petalBalance ?? 0,
      quest: {
        key: quest.key,
        title: quest.title,
        basePetals: quest.basePetals,
        bonusPetals: quest.bonusPetals,
        bonusEligible: assignment.bonusEligible,
      },
    });
  } catch (error) {
    console.error("Quest claim error", error);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}