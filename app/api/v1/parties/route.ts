import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { logger } from "@/app/lib/logger";

const ListQuerySchema = z.object({
  gameMode: z.string().min(1).optional(),
  status: z.string().min(1).optional(),
  isPublic: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const CreateSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  maxMembers: z.coerce.number().int().min(2).max(8).default(4),
  isPublic: z.boolean().default(true),
  gameMode: z.string().min(1).optional(),
  settings: z.record(z.any()).optional(),
});

const memberSelect = {
  id: true,
  username: true,
  display_name: true,
  avatarUrl: true,
} as const;

export async function GET(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = ListQuerySchema.parse({
      gameMode: searchParams.get("gameMode") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      isPublic: searchParams.get("isPublic") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      offset: searchParams.get("offset") ?? undefined,
    });

    const [parties, totalCount] = await Promise.all([
      db.party.findMany({
        where: {
          ...(params.gameMode ? { gameMode: params.gameMode } : {}),
          ...(params.status ? { status: params.status } : {}),
          ...(typeof params.isPublic === "boolean" ? { isPublic: params.isPublic } : {}),
        },
        include: {
          leader: { select: memberSelect },
          members: {
            include: {
              user: { select: memberSelect },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: params.limit,
        skip: params.offset,
      }),
      db.party.count({
        where: {
          ...(params.gameMode ? { gameMode: params.gameMode } : {}),
          ...(params.status ? { status: params.status } : {}),
          ...(typeof params.isPublic === "boolean" ? { isPublic: params.isPublic } : {}),
        },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      data: {
        parties: parties.map((party) => ({
          id: party.id,
          name: party.name,
          description: party.description,
          maxMembers: party.maxMembers,
          isPublic: party.isPublic,
          status: party.status,
          gameMode: party.gameMode,
          settings: party.settings,
          createdAt: party.createdAt.toISOString(),
          updatedAt: party.updatedAt.toISOString(),
          leader: party.leader,
          members: party.members.map((member) => ({
            id: member.id,
            role: member.role,
            joinedAt: member.joinedAt.toISOString(),
            lastActiveAt: member.lastActiveAt.toISOString(),
            user: member.user,
          })),
          memberCount: party.members.length,
        })),
        totalCount,
        hasMore: params.offset + params.limit < totalCount,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid query parameters" }, { status: 400 });
    }

    logger.error("Failed to fetch parties", { extra: { error } });
    return NextResponse.json({ ok: false, error: "Failed to fetch parties" }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const payload = CreateSchema.parse(await request.json());

    const partyData: any = {
      name: payload.name,
      maxMembers: payload.maxMembers,
      isPublic: payload.isPublic,
      leaderId: user.id,
      members: {
        create: {
          userId: user.id,
          role: "leader",
        },
      },
    };
    if (payload.description !== undefined) partyData.description = payload.description;
    if (payload.gameMode !== undefined) partyData.gameMode = payload.gameMode;
    if (payload.settings !== undefined) partyData.settings = payload.settings;
    const party = await db.party.create({
      data: partyData,
      include: {
        leader: { select: memberSelect },
        members: {
          include: {
            user: { select: memberSelect },
          },
        },
      },
    });

    logger.info("Party created", { extra: { partyId: party.id, leaderId: user.id } });

    return NextResponse.json(
      {
        ok: true,
        data: {
          id: party.id,
          name: party.name,
          description: party.description,
          maxMembers: party.maxMembers,
          isPublic: party.isPublic,
          status: party.status,
          gameMode: party.gameMode,
          settings: party.settings,
          createdAt: party.createdAt.toISOString(),
          updatedAt: party.updatedAt.toISOString(),
          leader: party.leader,
          members: party.members.map((member) => ({
            id: member.id,
            role: member.role,
            joinedAt: member.joinedAt.toISOString(),
            lastActiveAt: member.lastActiveAt.toISOString(),
            user: member.user,
          })),
          memberCount: party.members.length,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    }

    logger.error("Failed to create party", { extra: { error } });
    return NextResponse.json({ ok: false, error: "Failed to create party" }, { status: 500 });
  }
}
