"use server";

import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireUserId } from "@/app/lib/auth";

const db = new PrismaClient();
const ONE_YEAR = 1000 * 60 * 60 * 24 * 365;

export async function renameGamertag(newTag: string) {
  const userId = await requireUserId();

  const tag = newTag.trim().replace(/[^A-Za-z0-9\-_ ]/g, "").replace(/\s+/g, "-");
  if (tag.length < 3 || tag.length > 24) throw new Error("Gamertag must be 3–24 chars");

  // reserved words (expand as you like)
  const reserved = new Set(["admin","moderator","otakumori","support","staff"]);
  if (reserved.has(tag.toLowerCase())) throw new Error("That tag is reserved");

  const existing = await db.userProfile.findUnique({ where: { userId } });
  if (existing?.gamertagChangedAt) {
    const delta = Date.now() - new Date(existing.gamertagChangedAt).getTime();
    if (delta < ONE_YEAR) throw new Error("You can change your gamertag once per year");
  }

  const collision = await db.userProfile.findFirst({
    where: { gamertag: { equals: tag, mode: "insensitive" } },
    select: { userId: true },
  });
  if (collision && collision.userId !== userId) throw new Error("Gamertag is taken");

  // upsert
  const profile = await db.userProfile.upsert({
    where: { userId },
    update: { gamertag: tag, gamertagChangedAt: new Date() },
    create: { userId, gamertag: tag, gamertagChangedAt: new Date() },
    select: { gamertag: true },
  });

  // mirror to Clerk public metadata
  const me = await currentUser();
  if (me) {
    const client = await clerkClient();
    await client.users.updateUser(me.id, {
      publicMetadata: { ...me.publicMetadata, gamertag: profile.gamertag },
    });
  }

  revalidatePath("/profile");
  return profile.gamertag;
}
