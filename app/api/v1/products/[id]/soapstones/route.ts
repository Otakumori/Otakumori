import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/lib/db';
import { z } from 'zod';

export const runtime = 'nodejs';

const createSchema = z.object({
  message: z.string().min(1).max(280),
  template: z.string().optional(),
});

// GET /api/v1/products/[id]/soapstones - List soapstones for a product
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id;
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const sortBy = searchParams.get('sortBy') || 'praise'; // 'praise' | 'recent'

    const soapstones = await db.productSoapstone.findMany({
      where: {
        productId,
        status: 'VISIBLE',
      },
      include: {
        User: {
          select: {
            id: true,
            username: true,
            display_name: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            ProductSoapstonePraise: true,
          },
        },
      },
      orderBy: sortBy === 'praise' ? { appraises: 'desc' } : { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      ok: true,
      data: {
        soapstones: soapstones.map((s) => ({
          id: s.id,
          message: s.text,
          praiseCount: s.appraises,
          createdAt: s.createdAt,
          author: s.User,
        })),
        total: soapstones.length,
      },
    });
  } catch (error) {
    console.error('Failed to fetch product soapstones:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch soapstones' }, { status: 500 });
  }
}

// POST /api/v1/products/[id]/soapstones - Create a soapstone
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const productId = params.id;
    const body = await req.json();
    const validation = createSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ ok: false, error: 'Invalid request data' }, { status: 400 });
    }

    const { message, template: _template } = validation.data;

    // Cost: 5 petals to place a sign
    const SOAPSTONE_COST = 5;

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, petalBalance: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    if (user.petalBalance < SOAPSTONE_COST) {
      return NextResponse.json({ ok: false, error: 'Insufficient petals' }, { status: 400 });
    }

    // Create soapstone and deduct petals in transaction
    const soapstone = await db.$transaction(async (tx) => {
      // Deduct petals
      await tx.user.update({
        where: { id: user.id },
        data: { petalBalance: { decrement: SOAPSTONE_COST } },
      });

      // Create soapstone
      return tx.productSoapstone.create({
        data: {
          productId,
          userId: user.id,
          text: message,
        },
        include: {
          User: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      });
    });

    return NextResponse.json({
      ok: true,
      data: {
        soapstone: {
          id: soapstone.id,
          message: soapstone.text,
          praiseCount: 0,
          createdAt: soapstone.createdAt,
          author: soapstone.User,
        },
      },
    });
  } catch (error) {
    console.error('Failed to create product soapstone:', error);
    return NextResponse.json({ ok: false, error: 'Failed to create soapstone' }, { status: 500 });
  }
}
