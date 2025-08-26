/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";

export type Viewer = { id: string; nsfw: boolean } | null;

export async function getViewer(): Promise<Viewer> {
  try {
    const { userId } = auth();
    if (!userId) return null; // guest
    
    const user = await prisma.user.findUnique({ 
      where: { clerkId: userId }, 
      select: { id: true, nsfwEnabled: true } 
    });
    
    if (!user) return null; // user not found in our DB
    
    return { 
      id: user.id, 
      nsfw: user.nsfwEnabled ?? true // default true for signed-in
    };
  } catch (error) {
    console.error("Error getting viewer:", error);
    return null;
  }
}

export function productWhere(viewer: Viewer, category?: string) {
  const base: any = { active: true };
  if (category) base.category = category;
  if (!viewer) base.nsfw = false; // guests see SFW only
  return base;
}

export function isNSFWAllowed(viewer: Viewer): boolean {
  return viewer?.nsfw ?? false;
}
