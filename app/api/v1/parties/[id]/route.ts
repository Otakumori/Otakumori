// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { PartyUpdateSchema } from '@/app/lib/contracts';
import { logger } from '@/app/lib/logger';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const party = await db.party.findUnique({
      where: { id: params.id },
      include: {
        User: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        PartyMember: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
        sessions: {
          where: { status: 'active' },
          include: {
            CoopSessionParticipant: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!party) {
      return NextResponse.json({ ok: false, error: 'Party not found' }, { status: 404 });
    }

    // Check if user is a member or if party is public
    const isMember = party.members.some((member) => member.userId === userId);
    if (!isMember && !party.isPublic) {
      return NextResponse.json({ ok: false, error: 'Access denied' }, { status: 403 });
    }

    const transformedParty = {
      ...party,
      memberCount: party.members.length,
      createdAt: party.createdAt.toISOString(),
      updatedAt: party.updatedAt.toISOString(),
      sessions: party.sessions.map((session) => ({
        ...session,
        startedAt: session.startedAt.toISOString(),
        endedAt: session.endedAt?.toISOString(),
        createdAt: session.createdAt.toISOString(),
      })),
    };

    return NextResponse.json({
      ok: true,
      data: transformedParty,
    });
  } catch (error) {
    logger.error('Failed to fetch party', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return NextResponse.json({ ok: false, error: 'Failed to fetch party' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = PartyUpdateSchema.parse(body);

    // Check if user is the party leader
    const party = await db.party.findUnique({
      where: { id: params.id },
      select: { leaderId: true },
    });

    if (!party) {
      return NextResponse.json({ ok: false, error: 'Party not found' }, { status: 404 });
    }

    if (party.leaderId !== userId) {
      return NextResponse.json(
        { ok: false, error: 'Only the party leader can update the party' },
        { status: 403 },
      );
    }

    const updateData: any = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.maxMembers !== undefined) updateData.maxMembers = validatedData.maxMembers;
    if (validatedData.isPublic !== undefined) updateData.isPublic = validatedData.isPublic;
    if (validatedData.gameMode !== undefined) updateData.gameMode = validatedData.gameMode;
    if (validatedData.settings !== undefined) updateData.settings = validatedData.settings;
    const updatedParty = await db.party.update({
      where: { id: params.id },
      data: updateData,
      include: {
        User: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        PartyMember: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    const transformedParty = {
      ...updatedParty,
      memberCount: updatedParty.members.length,
      createdAt: updatedParty.createdAt.toISOString(),
      updatedAt: updatedParty.updatedAt.toISOString(),
    };

    logger.info('Party updated', { extra: { partyId: params.id, leaderId: userId } });

    return NextResponse.json({
      ok: true,
      data: transformedParty,
    });
  } catch (error) {
    logger.error('Failed to update party', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return NextResponse.json({ ok: false, error: 'Failed to update party' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is the party leader
    const party = await db.party.findUnique({
      where: { id: params.id },
      select: { leaderId: true },
    });

    if (!party) {
      return NextResponse.json({ ok: false, error: 'Party not found' }, { status: 404 });
    }

    if (party.leaderId !== userId) {
      return NextResponse.json(
        { ok: false, error: 'Only the party leader can delete the party' },
        { status: 403 },
      );
    }

    await db.party.delete({
      where: { id: params.id },
    });

    logger.info('Party deleted', { extra: { partyId: params.id, leaderId: userId } });

    return NextResponse.json({
      ok: true,
      data: { message: 'Party deleted successfully' },
    });
  } catch (error) {
    logger.error('Failed to delete party', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return NextResponse.json({ ok: false, error: 'Failed to delete party' }, { status: 500 });
  }
}
