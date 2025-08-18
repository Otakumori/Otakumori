export const dynamic = "force-dynamic";      // tells Next this cannot be statically analyzed
export const runtime = "nodejs";              // keep on Node runtime (not edge)
export const preferredRegion = "iad1";        // optional: co-locate w/ your logs region
export const maxDuration = 10;                // optional guard

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { PrismaClient } from "@prisma/client";
import { ensureDailyAssignments, userDayNY } from "@/app/lib/quests/server";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function GET() {
  try {
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
    
    // Ensure today's quests are assigned
    const today = await ensureDailyAssignments(user.id, day);
    
    // Get backlog (incomplete quests from previous days)
    const backlog = await prisma.questAssignment.findMany({
      where: { 
        userId: user.id, 
        day: { lt: day }, 
        completedAt: null 
      },
      include: { quest: true }, 
      take: 20, 
      orderBy: { day: "desc" }
    });

    // Get user's current petal balance
    const userRecord = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { petalBalance: true }
    });

    return NextResponse.json({ 
      today, 
      backlog, 
      petalBalance: userRecord?.petalBalance || 0,
      currentDay: day
    });
    
  } catch (error) {
    console.error("Quest list error:", error);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
