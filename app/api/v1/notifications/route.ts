export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { db } from "@/lib/db";

const QuerySchema = z.object({
  type: z.string().min(1).optional(),
  read: z.enum(["true", "false"]).transform((value) => value === "true").optional(),
  cursor: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

const MarkReadSchema = z.object({
  notificationIds: z.array(z.string().min(1)).min(1),
});

export async function GET(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = QuerySchema.parse({
      type: searchParams.get("type") ?? undefined,
      read: searchParams.get("read") ?? undefined,
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const user = await db.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    const notifications = await db.notification.findMany({
      where: {
        profileId: user.id,
        ...(params.type ? { type: params.type } : {}),
        ...(typeof params.read === "boolean" ? { read: params.read } : {}),
        ...(params.cursor ? { createdAt: { lt: new Date(params.cursor) } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: params.limit + 1,
    });

    const hasMore = notifications.length > params.limit;
    const sliced = hasMore ? notifications.slice(0, -1) : notifications;

    const unreadCount = await db.notification.count({
      where: {
        profileId: user.id,
        read: false,
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        notifications: sliced.map((notification) => ({
          id: notification.id,
          profileId: notification.profileId,
          type: notification.type,
          payload: notification.payload,
          read: notification.read,
          createdAt: notification.createdAt.toISOString(),
        })),
        unreadCount,
        nextCursor: hasMore ? sliced[sliced.length - 1]?.createdAt.toISOString() : undefined,
        hasMore,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid query parameters" }, { status: 400 });
    }

    console.error("Notifications fetch error", error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = MarkReadSchema.parse(await request.json());

    const user = await db.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    await db.notification.updateMany({
      where: {
        id: { in: body.notificationIds },
        profileId: user.id,
      },
      data: { read: true },
    });

    return NextResponse.json({ ok: true, data: { success: true } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    }

    console.error("Mark notifications read error", error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
