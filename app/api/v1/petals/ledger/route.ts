import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
export const runtime = "nodejs";

export async function GET() {
  const u = await currentUser();
  if (!u) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status:401 });

  const [user, entries] = await Promise.all([
    prisma.user.findUnique({ where: { id: u.id }, select: { petalBalance:true } }),
    prisma.petalLedger.findMany({
      where: { userId: u.id },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id:true, type:true, amount:true, reason:true, createdAt:true },
    }),
  ]);

  const totalEarned = entries.filter(e=>e.amount>0).reduce((a,b)=>a+b.amount, 0);
  const totalSpent  = entries.filter(e=>e.amount<0).reduce((a,b)=>a+Math.abs(b.amount), 0);

  return NextResponse.json({
    ok: true,
    data: {
      balance: user?.petalBalance ?? 0,
      totalEarned,
      totalSpent,
      entries: entries.map(e => ({ ...e, createdAt: e.createdAt.toISOString() })),
    },
  });
}
