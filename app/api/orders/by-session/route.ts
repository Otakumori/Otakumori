export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";

interface RuneCombo {
  id: string;
  comboId: string;
  revealCopy?: string;
  cosmeticBurst?: string;
  members: string[];
  isActive?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ ok: false, error: "Session ID required" }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { stripeId: sessionId },
      include: {
        OrderItem: true,
        UserRunes: {
          include: { rune: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== user.id) {
      return NextResponse.json({ ok: false, error: "Access denied" }, { status: 403 });
    }

    const runes = order.UserRunes.map((userRune) => ({
      id: userRune.rune.id,
      canonicalId: userRune.rune.canonicalId,
      displayName: userRune.rune.displayName,
      glyph: userRune.rune.glyph,
      lore: userRune.rune.lore,
    }));

    const [siteConfig, allUserRunes] = await Promise.all([
      db.siteConfig.findUnique({ where: { id: "singleton" } }),
      db.userRune.findMany({
        where: { userId: user.id },
        include: { rune: true },
      }),
    ]);

    const userRuneIds = new Set(allUserRunes.map((userRune) => userRune.rune.canonicalId));
    const combos = resolveCompletedCombos(siteConfig?.runes, userRuneIds);

    return NextResponse.json({
      ok: true,
      data: {
        id: order.id,
        petalsAwarded: order.petalsAwarded ?? 0,
        runes,
        combos,
      },
    });
  } catch (error) {
    console.error("Order fetch error", error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}

function resolveCompletedCombos(rawConfig: unknown, userRuneIds: Set<string>) {
  if (!rawConfig || typeof rawConfig !== "object") {
    return [] as Array<{ id: string; comboId: string; revealCopy?: string; cosmeticBurst?: string }>;
  }

  const combos = (rawConfig as { combos?: RuneCombo[] }).combos;
  if (!Array.isArray(combos)) {
    return [];
  }

  return combos
    .filter((combo) => combo?.isActive !== false && Array.isArray(combo?.members))
    .filter((combo) => combo.members.every((member) => userRuneIds.has(member)))
    .map((combo) => ({
      id: combo.id,
      comboId: combo.comboId,
      revealCopy: combo.revealCopy,
      cosmeticBurst: combo.cosmeticBurst,
    }));
}