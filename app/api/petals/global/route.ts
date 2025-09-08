import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

export async function GET() {
  try {
    const g = await db.globalPetals.findUnique({ where: { id: "current" }});
    if (!g || !g.active) return NextResponse.json({ active: false });
    return NextResponse.json({ 
      active: true, 
      total: g.total, 
      goal: g.goal, 
      eventName: g.eventName 
    });
  } catch (error) {
    console.error("Error fetching global petals:", error);
    return NextResponse.json({ active: false });
  }
}
