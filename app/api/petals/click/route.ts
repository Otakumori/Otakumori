export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { z } from "zod";

const schema = z.object({
  // Optional: can be called without body for simple clicks
});

// Simple in-memory rate limiter (replace with Upstash/Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(userId: string, maxClicks: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(userId);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + windowMs });
    return false;
  }
  
  if (record.count >= maxClicks) {
    return true;
  }
  
  record.count++;
  return false;
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    if (isRateLimited(userId)) {
      return NextResponse.json({ ok: false, error: "Rate limited" }, { status: 429 });
    }

    // Validate request body if present
    try {
      const body = await req.json();
      schema.parse(body);
    } catch {
      // No body is fine for simple clicks
    }

    // Get current user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        petalBalance: true, 
        dailyClicks: true, 
        lastClickDayUTC: true 
      }
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    // Check daily click limits
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastClickDay = user.lastClickDayUTC ? new Date(user.lastClickDayUTC) : new Date(0);
    
    let dailyClicks = user.dailyClicks;
    let petalBalance = user.petalBalance;

    // Reset daily clicks if it's a new day
    if (lastClickDay < today) {
      dailyClicks = 0;
    }

    // Check daily limit (configurable via env)
    const dailyLimit = parseInt(process.env.NEXT_PUBLIC_DAILY_PETAL_LIMIT || "500");
    
    if (dailyClicks >= dailyLimit) {
      return NextResponse.json({ 
        ok: false, 
        error: "Daily petal limit reached",
        dailyClicks,
        dailyLimit
      }, { status: 429 });
    }

    // Award petals (1-3 random)
    const petalsAwarded = Math.floor(Math.random() * 3) + 1;
    const newBalance = petalBalance + petalsAwarded;
    const newDailyClicks = dailyClicks + 1;

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: {
        petalBalance: newBalance,
        dailyClicks: newDailyClicks,
        lastClickDayUTC: now
      }
    });

    // Record in petal ledger
    await prisma.petalLedger.create({
      data: {
        userId,
        type: "earn",
        amount: petalsAwarded,
        reason: "tree_petal_click"
      }
    });

    // Check for achievements
    const achievements = [];
    
    // First click achievement
    if (newDailyClicks === 1) {
      try {
        const achievement = await prisma.achievement.findUnique({
          where: { code: "first_daily_click" }
        });
        
        if (achievement) {
          await prisma.userAchievement.create({
            data: {
              userId,
              achievementId: achievement.id
            }
          });
          achievements.push(achievement);
        }
      } catch (error) {
        // Achievement might not exist yet, continue
      }
    }

    // Milestone achievements
    const milestones = [10, 50, 100, 500, 1000];
    for (const milestone of milestones) {
      if (newDailyClicks === milestone) {
        try {
          const achievement = await prisma.achievement.findUnique({
            where: { code: `daily_click_${milestone}` }
          });
          
          if (achievement) {
            await prisma.userAchievement.create({
              data: {
                userId,
                achievementId: achievement.id
              }
            });
            achievements.push(achievement);
          }
        } catch (error) {
          // Achievement might not exist yet, continue
        }
      }
    }

    return NextResponse.json({
      ok: true,
      data: {
        petalsAwarded,
        newBalance,
        dailyClicks: newDailyClicks,
        dailyLimit,
        achievements: achievements.map(a => ({ code: a.code, name: a.name }))
      }
    });

  } catch (error) {
    console.error("Petal click error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}
