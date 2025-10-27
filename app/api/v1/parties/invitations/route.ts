// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { PartyInvitationCreateSchema } from '@/app/lib/contracts';
import { logger } from '@/app/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = PartyInvitationCreateSchema.parse(body);

    // Check if party exists and user is a member
    const party = await db.party.findUnique({
      where: { id: validatedData.partyId },
      include: {
        members: true,
      },
    });

    if (!party) {
      return NextResponse.json({ ok: false, error: 'Party not found' }, { status: 404 });
    }

    const isMember = party.members.some((member) => member.userId === userId);
    if (!isMember) {
      return NextResponse.json(
        { ok: false, error: 'Only party members can send invitations' },
        { status: 403 },
      );
    }

    // Check if party is full
    if (party.members.length >= party.maxMembers) {
      return NextResponse.json({ ok: false, error: 'Party is full' }, { status: 400 });
    }

    // Check if user is already a member
    const isAlreadyMember = party.members.some(
      (member) => member.userId === validatedData.inviteeId,
    );
    if (isAlreadyMember) {
      return NextResponse.json(
        { ok: false, error: 'User is already a member of this party' },
        { status: 400 },
      );
    }

    // Check if there's already a pending invitation
    const existingInvitation = await db.partyInvitation.findUnique({
      where: {
        partyId_inviteeId: {
          partyId: validatedData.partyId,
          inviteeId: validatedData.inviteeId,
        },
      },
    });

    if (existingInvitation && existingInvitation.status === 'pending') {
      return NextResponse.json({ ok: false, error: 'Invitation already sent' }, { status: 400 });
    }

    // Set expiration date (24 hours from now if not provided)
    const expiresAt = validatedData.expiresAt
      ? new Date(validatedData.expiresAt)
      : new Date(Date.now() + 24 * 60 * 60 * 1000);

    const inviteData: any = {
      partyId: validatedData.partyId,
      inviterId: userId,
      inviteeId: validatedData.inviteeId,
      expiresAt,
    };
    if (validatedData.message !== undefined) {
      inviteData.message = validatedData.message;
    }
    const invitation = await db.partyInvitation.create({
      data: inviteData,
      include: {
        party: {
          select: {
            id: true,
            name: true,
            description: true,
            gameMode: true,
          },
        },
        inviter: {
          select: {
            id: true,
            username: true,
            display_name: true,
            avatarUrl: true,
          },
        },
        invitee: {
          select: {
            id: true,
            username: true,
            display_name: true,
            avatarUrl: true,
          },
        },
      },
    });

    const transformedInvitation = {
      ...invitation,
      expiresAt: invitation.expiresAt.toISOString(),
      createdAt: invitation.createdAt.toISOString(),
      respondedAt: invitation.respondedAt?.toISOString(),
    };

    logger.info('Party invitation sent', {
      extra: {
        invitationId: invitation.id,
        partyId: validatedData.partyId,
        inviterId: userId,
        inviteeId: validatedData.inviteeId,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        data: transformedInvitation,
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error('Failed to send party invitation', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return NextResponse.json(
      { ok: false, error: 'Failed to send party invitation' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'received'; // 'sent' or 'received'

    const where = type === 'sent' ? { inviterId: userId } : { inviteeId: userId };

    const invitations = await db.partyInvitation.findMany({
      where,
      include: {
        party: {
          select: {
            id: true,
            name: true,
            description: true,
            gameMode: true,
            status: true,
            maxMembers: true,
            members: {
              select: {
                id: true,
              },
            },
          },
        },
        inviter: {
          select: {
            id: true,
            username: true,
            display_name: true,
            avatarUrl: true,
          },
        },
        invitee: {
          select: {
            id: true,
            username: true,
            display_name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const transformedInvitations = invitations.map((invitation) => ({
      ...invitation,
      expiresAt: invitation.expiresAt.toISOString(),
      createdAt: invitation.createdAt.toISOString(),
      respondedAt: invitation.respondedAt?.toISOString(),
      party: {
        ...invitation.party,
        memberCount: invitation.party.members.length,
      },
    }));

    return NextResponse.json({
      ok: true,
      data: transformedInvitations,
    });
  } catch (error) {
    logger.error('Failed to fetch party invitations', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch party invitations' },
      { status: 500 },
    );
  }
}
