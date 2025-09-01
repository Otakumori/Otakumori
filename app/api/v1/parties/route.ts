import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/lib/db';
import { PartyCreateSchema, PartyListRequestSchema, PartySchema } from '@/app/lib/contracts';
import { logger } from '@/app/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = {
      gameMode: searchParams.get('gameMode') || undefined,
      status: searchParams.get('status') || undefined,
      isPublic: searchParams.get('isPublic') ? searchParams.get('isPublic') === 'true' : undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    const validatedQuery = PartyListRequestSchema.parse(query);

    // Build where clause
    const where: any = {};
    if (validatedQuery.gameMode) where.gameMode = validatedQuery.gameMode;
    if (validatedQuery.status) where.status = validatedQuery.status;
    if (validatedQuery.isPublic !== undefined) where.isPublic = validatedQuery.isPublic;

    // Get parties with member count
    const [parties, totalCount] = await Promise.all([
      db.party.findMany({
        where,
        include: {
          leader: {
            select: {
              id: true,
              username: true,
              display_name: true,
              avatarUrl: true,
            },
          },
          members: {
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
        orderBy: { createdAt: 'desc' },
        take: validatedQuery.limit,
        skip: validatedQuery.offset,
      }),
      db.party.count({ where }),
    ]);

    // Transform parties to include member count
    const transformedParties = parties.map((party) => ({
      ...party,
      memberCount: party.members.length,
      createdAt: party.createdAt.toISOString(),
      updatedAt: party.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      ok: true,
      data: {
        parties: transformedParties,
        totalCount,
        hasMore: validatedQuery.offset + validatedQuery.limit < totalCount,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch parties', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return NextResponse.json({ ok: false, error: 'Failed to fetch parties' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = PartyCreateSchema.parse(body);

    // Create party with leader as first member
    const party = await db.party.create({
      data: {
        ...validatedData,
        leaderId: userId,
        members: {
          create: {
            userId: userId,
            role: 'leader',
          },
        },
      },
      include: {
        leader: {
          select: {
            id: true,
            username: true,
            display_name: true,
            avatarUrl: true,
          },
        },
        members: {
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

    const transformedParty = {
      ...party,
      memberCount: party.members.length,
      createdAt: party.createdAt.toISOString(),
      updatedAt: party.updatedAt.toISOString(),
    };

    logger.info('Party created', { extra: { partyId: party.id, leaderId: userId } });

    return NextResponse.json(
      {
        ok: true,
        data: transformedParty,
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error('Failed to create party', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return NextResponse.json({ ok: false, error: 'Failed to create party' }, { status: 500 });
  }
}
