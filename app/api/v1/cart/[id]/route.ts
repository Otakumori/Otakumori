// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db as prisma } from '@/lib/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Find cart item through user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          where: { id: params.id },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ ok: false, error: 'Cart item not found' }, { status: 404 });
    }

    await prisma.cartItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ ok: true, data: { deleted: true } });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
