import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  // Validate a tiny bit
  const clean = ["primary", "secondary", "charm", "relic"].reduce((acc, k) => {
    const v = body?.[k];
    if (typeof v === "string" && v.length <= 64) (acc as any)[k] = v;
    return acc;
  }, {} as Record<string, string>);

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { loadout: clean },
  });

  return NextResponse.json({ ok: true });
}
