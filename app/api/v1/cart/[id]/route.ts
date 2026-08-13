
import { logger } from '@/app/lib/logger';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { generateRequestId } from '@/app/lib/request-id';
import {
  AuthenticationRequiredError,
  LocalUserUnavailableError,
  requireLocalViewer,
} from '@/app/lib/auth/viewer';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extract request metadata
    const requestId = req.headers.get('x-request-id') || generateRequestId();
    
    const { localUserId } = await requireLocalViewer();

    // Find cart item through user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: localUserId },
      include: {
        CartItem: {
          where: { id: params.id },
        },
      },
    });

    if (!cart || cart.CartItem.length === 0) {
      return NextResponse.json({ ok: false, error: 'Cart item not found' }, { status: 404 });
    }

    await prisma.cartItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ ok: true, data: { deleted: true }, requestId });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof LocalUserUnavailableError) {
      return NextResponse.json(
        { ok: false, error: 'Account data is temporarily unavailable. Please try again shortly.' },
        { status: 503 },
      );
    }
    logger.error(
      'Error deleting cart item:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
