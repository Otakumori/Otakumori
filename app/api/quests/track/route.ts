import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { userDayNY, ensureDailyAssignments } from "@/app/lib/quests/server";

const prisma = new PrismaClient();
const redis = new Redis({ 
  url: process.env.UPSTASH_REDIS_REST_URL!, 
  token: process.env.UPSTASH_REDIS_REST_TOKEN! 
});
const limit = new Ratelimit({ 
  redis, 
  limiter: Ratelimit.slidingWindow(20, "1 m") 
});

export async function POST(req: Request) {
  try {
    // Rate limiting
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "anon";
    const rl = await limit.limit(ip); 
    if (!rl.success) {
      return NextResponse.json({ error: "rate" }, { status: 429 });
    }

    const { type } = await req.json(); // e.g., "view-product", "submit-review", "gacha-roll", "purchase"
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.SUPABASE_SERVICE_ROLE_KEY!, 
      { cookies: { get: k => cookies().get(k)?.value } }
    );
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "auth" }, { status: 401 });
    }

    const day = userDayNY();
    await ensureDailyAssignments(user.id, day);

    // Map event types to quest keys
    const eventToQuestMap: Record<string, string[]> = {
      "view-product": ["view-3-products"],
      "submit-review": ["add-1-review"],
      "gacha-roll": ["roll-gacha"],
      "purchase": ["complete-purchase"],
      "visit-checkout": ["visit-checkout"],
      "browse-collection": ["browse-collections"]
    };
    
    const questKeys = eventToQuestMap[type] || [];
    if (!questKeys.length) {
      return NextResponse.json({ ok: true, message: "No quests for this event type" });
    }

    // Update progress for matching quests
    const assignments = await prisma.questAssignment.findMany({
      where: { 
        userId: user.id, 
        day, 
        quest: { key: { in: questKeys } } 
      }, 
      include: { quest: true }
    });

    const updates = [];
    for (const assignment of assignments) {
      if (assignment.completedAt) continue; // Already completed
      
      const newProgress = Math.min(assignment.target, assignment.progress + 1);
      const isCompleted = newProgress >= assignment.target;
      
      updates.push(
        prisma.questAssignment.update({
          where: { id: assignment.id },
          data: { 
            progress: newProgress, 
            completedAt: isCompleted ? new Date() : null 
          }
        })
      );
    }

    if (updates.length > 0) {
      await prisma.$transaction(updates);
    }

    return NextResponse.json({ 
      ok: true, 
      updated: updates.length,
      quests: assignments.map(a => ({
        key: a.quest.key,
        progress: a.progress,
        target: a.target,
        completed: !!a.completedAt
      }))
    });
    
  } catch (error) {
    console.error("Quest track error:", error);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
