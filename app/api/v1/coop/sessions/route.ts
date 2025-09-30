// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { CoopSessionCreateSchema } from '@/app/lib/contracts';
import { logger } from '@/app/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CoopSessionCreateSchema.parse(body);

    // Check if party exists and user is a member
    const party = await db.party.findUnique({
      where: { id: validatedData.partyId },
      include: {
        members: true,
        sessions: {
          where: { status: 'active' },
        },
      },
    });

    if (!party) {
      return NextResponse.json({ ok: false, error: 'Party not found' }, { status: 404 });
    }

    const isMember = party.members.some((member) => member.userId === userId);
    if (!isMember) {
      return NextResponse.json(
        { ok: false, error: 'Only party members can start coop sessions' },
        { status: 403 },
      );
    }

    // Check if there's already an active session
    if (party.sessions.length > 0) {
      return NextResponse.json(
        { ok: false, error: 'Party already has an active session' },
        { status: 400 },
      );
    }

    // Create coop session
    const session = await db.coopSession.create({
      data: {
        partyId: validatedData.partyId,
        gameType: validatedData.gameType,
        gameId: validatedData.gameId,
        settings: validatedData.settings as any,
      },
      include: {
        party: {
          select: {
            id: true,
            name: true,
            gameMode: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                display_name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    // Add all party members as participants
    const participants = await Promise.all(
      party.members.map((member) =>
        db.coopSessionParticipant.create({
          data: {
            sessionId: session.id,
            userId: member.userId,
            role: member.role === 'leader' ? 'moderator' : 'player',
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                display_name: true,
                avatarUrl: true,
              },
            },
          },
        }),
      ),
    );

    // Update party status to in-game
    await db.party.update({
      where: { id: validatedData.partyId },
      data: { status: 'in-game' },
    });

    const transformedSession = {
      ...session,
      startedAt: session.startedAt.toISOString(),
      createdAt: session.createdAt.toISOString(),
      participants,
    };

    logger.info('Coop session started', {
      extra: {
        sessionId: session.id,
        partyId: validatedData.partyId,
        gameType: validatedData.gameType,
        userId,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        data: transformedSession,
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error('Failed to start coop session', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return NextResponse.json({ ok: false, error: 'Failed to start coop session' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const partyId = searchParams.get('partyId');
    const status = searchParams.get('status') || 'active';

    const where: any = { status };
    if (partyId) where.partyId = partyId;

    // Only show sessions where user is a participant
    const sessions = await db.coopSession.findMany({
      where: {
        ...where,
        participants: {
          some: { userId },
        },
      },
      include: {
        party: {
          select: {
            id: true,
            name: true,
            gameMode: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                display_name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    const transformedSessions = sessions.map((session) => ({
      ...session,
      startedAt: session.startedAt.toISOString(),
      endedAt: session.endedAt?.toISOString(),
      createdAt: session.createdAt.toISOString(),
    }));

    return NextResponse.json({
      ok: true,
      data: transformedSessions,
    });
  } catch (error) {
    logger.error('Failed to fetch coop sessions', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch coop sessions' },
      { status: 500 },
    );
  }
}
