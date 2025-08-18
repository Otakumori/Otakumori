import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Redis } from "@upstash/redis";
import { userDayNY, awardStreakShardIfEligible } from "@/app/lib/quests/server";

const prisma = new PrismaClient();
const redis = new Redis({ 
  url: process.env.UPSTASH_REDIS_REST_URL!, 
  token: process.env.UPSTASH_REDIS_REST_TOKEN! 
});

export async function POST(req: Request) {
  try {
    const { assignmentId } = await req.json();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.SUPABASE_SERVICE_ROLE_KEY!, 
      { cookies: { get: k => cookies().get(k)?.value } }
    );
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "auth" }, { status: 401 });
    }

    // Get the assignment with quest details
    const assignment = await prisma.questAssignment.findUnique({ 
      where: { id: assignmentId }, 
      include: { quest: true } 
    });
    
    if (!assignment || assignment.userId !== user.id) {
      return NextResponse.json({ error: "notfound" }, { status: 404 });
    }
    
    if (!assignment.completedAt) {
      return NextResponse.json({ error: "incomplete" }, { status: 400 });
    }
    
    if (assignment.claimedAt) {
      return NextResponse.json({ ok: true, already: true, message: "Already claimed" });
    }

    // Calculate reward with daily cap (120 petals/day)
    const day = assignment.day;
    const dailyCapKey = `petals:cap:${user.id}:${day}`;
    const usedToday = (await redis.get<number>(dailyCapKey)) || 0;
    const dailyCap = 120;
    
    const baseReward = assignment.quest.basePetals;
    const bonusReward = assignment.bonusEligible ? assignment.quest.bonusPetals : 0;
    const totalReward = baseReward + bonusReward;
    
    // Apply daily cap
    const availableToday = Math.max(0, dailyCap - usedToday);
    const actualReward = Math.min(totalReward, availableToday);

    // Award petals and mark as claimed
    if (actualReward > 0) {
      await prisma.$transaction([
        prisma.questAssignment.update({
          where: { id: assignment.id },
          data: { claimedAt: new Date() }
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { petalBalance: { increment: actualReward } }
        }),
        prisma.petalLedger.create({
          data: {
            userId: user.id,
            type: "earn",
            amount: actualReward,
            reason: `quest: ${assignment.quest.key}`
          }
        })
      ]);
    } else {
      await prisma.questAssignment.update({
        where: { id: assignment.id },
        data: { claimedAt: new Date() }
      });
    }

    // Update daily cap usage
    if (actualReward > 0) {
      await redis.set(dailyCapKey, usedToday + actualReward, { ex: 60 * 60 * 24 * 2 }); // 2 days TTL
    }

    // Award streak shard if eligible
    const streakShardAwarded = await awardStreakShardIfEligible(user.id, day);

    // Get updated petal balance
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { petalBalance: true }
    });

    return NextResponse.json({ 
      ok: true, 
      petalsGranted: actualReward,
      totalReward,
      capped: actualReward < totalReward,
      dailyCapUsed: usedToday + actualReward,
      dailyCapRemaining: dailyCap - (usedToday + actualReward),
      streakShardAwarded,
      newBalance: updatedUser?.petalBalance || 0,
      quest: {
        key: assignment.quest.key,
        title: assignment.quest.title,
        basePetals: assignment.quest.basePetals,
        bonusPetals: assignment.quest.bonusPetals,
        bonusEligible: assignment.bonusEligible
      }
    });
    
  } catch (error) {
    console.error("Quest claim error:", error);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
