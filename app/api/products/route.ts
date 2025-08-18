import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { log } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 10;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase().trim();

  try {
    // Replace with real source or Printify adapter
    const all = await getSeededProducts(); // bounded, in-process, < 100 items
    const filtered = q ? all.filter(p => p.title.toLowerCase().includes(q) || p.tags?.some((t: string) => t.includes(q))) : all;

    // Optional short TTL cache key
    if (redis) await redis.setex(`products:${q || "all"}`, 30, JSON.stringify(filtered));

    return NextResponse.json({ ok: true, items: filtered });
  } catch (e) {
    log("products_error", { message: String(e) });
    return NextResponse.json({ ok: false, items: [] }, { status: 200 });
  }
}

// TODO: swap for Printify/DB
async function getSeededProducts() {
  return [
    { id: "1", slug: "oni-tee", title: "Oni Tee", description: "Gothic Y2K anime drip", price: 29.0, images: [], tags: ["anime","oni"], stock: 12 },
    { id: "2", slug: "souls-hoodie", title: "Souls Hoodie", description: "Dark Souls inspired comfort", price: 45.0, images: [], tags: ["gaming","dark-souls"], stock: 8 },
    { id: "3", slug: "anime-pin-set", title: "Anime Pin Set", description: "Collectible enamel pins", price: 15.0, images: [], tags: ["anime","collectibles"], stock: 25 },
  ];
}
