import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { del } from "@vercel/blob";
import { z } from "zod";

import { db } from "@/lib/db";

const DeleteRequestSchema = z.object({
  key: z.string().min(1),
});

export async function DELETE(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ ok: false, error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const { key } = DeleteRequestSchema.parse(await request.json());

    const user = await db.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "USER_NOT_FOUND" }, { status: 404 });
    }

    const file = await db.userFile.findUnique({ where: { key } });
    if (!file || file.userId !== user.id) {
      return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
    }

    await db.userFile.delete({ where: { key } });

    await del(key);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "INVALID_PAYLOAD" }, { status: 400 });
    }

    console.error("Storage delete error", error);
    return NextResponse.json({ ok: false, error: "DELETE_ERROR" }, { status: 500 });
  }
}