// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/lib/db';
import { PartyInvitationResponseSchema } from '@/app/lib/contracts';
import { logger } from '@/app/lib/logger';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = PartyInvitationResponseSchema.parse(body);

    // Get the invitation
    const invitation = await db.partyInvitation.findUnique({
      where: { id: params.id },
      include: {
        party: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json({ ok: false, error: 'Invitation not found' }, { status: 404 });
    }

    // Check if user is the invitee
    if (invitation.inviteeId !== userId) {
      return NextResponse.json({ ok: false, error: 'Access denied' }, { status: 403 });
    }

    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { ok: false, error: 'Invitation has already been responded to' },
        { status: 400 },
      );
    }

    // Check if invitation has expired
    if (new Date() > invitation.expiresAt) {
      return NextResponse.json({ ok: false, error: 'Invitation has expired' }, { status: 400 });
    }

    // Check if party is still open and not full
    if (invitation.party.status !== 'open') {
      return NextResponse.json(
        { ok: false, error: 'Party is no longer accepting members' },
        { status: 400 },
      );
    }

    if (invitation.party.members.length >= invitation.party.maxMembers) {
      return NextResponse.json({ ok: false, error: 'Party is full' }, { status: 400 });
    }

    // Update invitation status
    const updatedInvitation = await db.partyInvitation.update({
      where: { id: params.id },
      data: {
        status: validatedData.status,
        respondedAt: new Date(),
      },
    });

    // If accepted, add user to party
    if (validatedData.status === 'accepted') {
      await db.partyMember.create({
        data: {
          partyId: invitation.partyId,
          userId: userId,
          role: 'member',
        },
      });

      // Update party member count and status if needed
      const newMemberCount = invitation.party.members.length + 1;
      const newStatus = newMemberCount >= invitation.party.maxMembers ? 'full' : 'open';

      await db.party.update({
        where: { id: invitation.partyId },
        data: { status: newStatus },
      });

      logger.info('User joined party', {
        extra: {
          partyId: invitation.partyId,
          userId,
          invitationId: params.id,
        },
      });
    }

    logger.info('Party invitation responded to', {
      extra: {
        invitationId: params.id,
        status: validatedData.status,
        userId,
      },
    });

    return NextResponse.json({
      ok: true,
      data: { message: `Invitation ${validatedData.status} successfully` },
    });
  } catch (error) {
    logger.error('Failed to respond to party invitation', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return NextResponse.json(
      { ok: false, error: 'Failed to respond to party invitation' },
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

    // Get the invitation
    const invitation = await db.partyInvitation.findUnique({
      where: { id: params.id },
    });

    if (!invitation) {
      return NextResponse.json({ ok: false, error: 'Invitation not found' }, { status: 404 });
    }

    // Check if user is the inviter or invitee
    if (invitation.inviterId !== userId && invitation.inviteeId !== userId) {
      return NextResponse.json({ ok: false, error: 'Access denied' }, { status: 403 });
    }

    await db.partyInvitation.delete({
      where: { id: params.id },
    });

    logger.info('Party invitation deleted', { extra: { invitationId: params.id, userId } });

    return NextResponse.json({
      ok: true,
      data: { message: 'Invitation deleted successfully' },
    });
  } catch (error) {
    logger.error('Failed to delete party invitation', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return NextResponse.json(
      { ok: false, error: 'Failed to delete party invitation' },
      { status: 500 },
    );
  }
}
