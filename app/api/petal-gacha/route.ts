import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireUserId } from "@/app/lib/auth";

const db = new PrismaClient();

const COST = 50; // petals per pull
const TABLE = [
  { key:"banner_sakura", weight: 30 },
  { key:"frame_violet", weight: 30 },
  { key:"title_ashen", weight: 25 },
  { key:"title_umbral", weight: 10 },
  { key:"relic_arcane", weight: 5 },
];

function pick(table = TABLE) {
  const sum = table.reduce((s,r)=>s+r.weight,0);
  let r = Math.random()*sum;
  for (const row of table) {
    if ((r -= row.weight) <= 0) return row.key;
  }
  return table[0].key;
}

export async function POST() {
  const userId = await requireUserId();

  const u = await db.userPetals.findUnique({ where: { userId }});
  const total = u?.total ?? 0;
  if (total < COST) return new NextResponse("Not enough petals", { status: 400 });

  const reward = pick();

  await db.$transaction([
    db.userPetals.update({ where: { userId }, data: { total: total - COST }}),
    db.userInventory.upsert({ where: { userId_itemKey: { userId, itemKey: reward }}, update: { count: { increment: 1 }}, create: { userId, itemKey: reward, count: 1 }})
  ]);

  return NextResponse.json({ ok: true, reward, remaining: total - COST });
}
