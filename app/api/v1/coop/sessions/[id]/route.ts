
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { CoopSessionUpdateSchema } from '@/app/lib/contracts';
import { logger } from '@/app/lib/logger';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const session = await db.coopSession.findUnique({
      where: { id: params.id },
      include: {
        Party: {
          select: {
            id: true,
            name: true,
            gameMode: true,
            status: true,
          },
        },
        CoopSessionParticipant: {
          include: {
            User: {
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

    if (!session) {
      return NextResponse.json({ ok: false, error: 'Session not found' }, { status: 404 });
    }

    // Check if user is a participant
    const isParticipant = session.CoopSessionParticipant.some((p) => p.userId === userId);
    if (!isParticipant) {
      return NextResponse.json({ ok: false, error: 'Access denied' }, { status: 403 });
    }

    const transformedSession = {
      ...session,
      startedAt: session.startedAt.toISOString(),
      endedAt: session.endedAt?.toISOString(),
      createdAt: session.createdAt.toISOString(),
    };

    return NextResponse.json({
      ok: true,
      data: transformedSession,
    });
  } catch (error) {
    logger.error('Failed to fetch coop session', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return NextResponse.json({ ok: false, error: 'Failed to fetch coop session' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CoopSessionUpdateSchema.parse(body);

    // Get session and check if user is a participant
    const session = await db.coopSession.findUnique({
      where: { id: params.id },
      include: {
        CoopSessionParticipant: true,
      },
    });

    if (!session) {
      return NextResponse.json({ ok: false, error: 'Session not found' }, { status: 404 });
    }

    const participant = session.CoopSessionParticipant.find((p) => p.userId === userId);
    if (!participant) {
      return NextResponse.json({ ok: false, error: 'Access denied' }, { status: 403 });
    }

    // Only moderators can update session status and settings
    if (validatedData.status || validatedData.settings) {
      if (participant.role !== 'moderator') {
        return NextResponse.json(
          { ok: false, error: 'Only moderators can update session status and settings' },
          { status: 403 },
        );
      }
    }

    // Update session
    const updateData: any = { ...validatedData };
    if (validatedData.status === 'completed' || validatedData.status === 'abandoned') {
      updateData.endedAt = new Date();
    } else if (validatedData.endedAt) {
      updateData.endedAt = new Date(validatedData.endedAt);
    }
    const updatedSession = await db.coopSession.update({
      where: { id: params.id },
      data: updateData,
      include: {
        Party: {
          select: {
            id: true,
            name: true,
            gameMode: true,
            status: true,
          },
        },
        CoopSessionParticipant: {
          include: {
            User: {
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

    // If session ended, update party status back to open
    if (validatedData.status === 'completed' || validatedData.status === 'abandoned') {
      await db.party.update({
        where: { id: session.partyId },
        data: { status: 'open' },
      });
    }

    const transformedSession = {
      ...updatedSession,
      startedAt: updatedSession.startedAt.toISOString(),
      endedAt: updatedSession.endedAt?.toISOString(),
      createdAt: updatedSession.createdAt.toISOString(),
    };

    logger.info('Coop session updated', {
      extra: {
        sessionId: params.id,
        userId,
        updates: Object.keys(validatedData),
      },
    });

    return NextResponse.json({
      ok: true,
      data: transformedSession,
    });
  } catch (error) {
    logger.error('Failed to update coop session', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return NextResponse.json(
      { ok: false, error: 'Failed to update coop session' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get session and check if user is a moderator
    const session = await db.coopSession.findUnique({
      where: { id: params.id },
      include: {
        CoopSessionParticipant: true,
      },
    });

    if (!session) {
      return NextResponse.json({ ok: false, error: 'Session not found' }, { status: 404 });
    }

    const participant = session.CoopSessionParticipant.find((p) => p.userId === userId);
    if (!participant || participant.role !== 'moderator') {
      return NextResponse.json(
        { ok: false, error: 'Only moderators can delete sessions' },
        { status: 403 },
      );
    }

    // Update party status back to open
    await db.party.update({
      where: { id: session.partyId },
      data: { status: 'open' },
    });

    // Delete session (cascade will handle participants)
    await db.coopSession.delete({
      where: { id: params.id },
    });

    logger.info('Coop session deleted', { extra: { sessionId: params.id, userId } });

    return NextResponse.json({
      ok: true,
      data: { message: 'Session deleted successfully' },
    });
  } catch (error) {
    logger.error('Failed to delete coop session', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return NextResponse.json(
      { ok: false, error: 'Failed to delete coop session' },
      { status: 500 },
    );
  }
}
