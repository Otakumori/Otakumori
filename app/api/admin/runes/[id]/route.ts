// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

// DELETE: Delete a rune definition
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Unauthorized',
        },
        { status: 401 },
      );
    }

    // TODO: Add admin role check
    // const user = await db.user.findUnique({ where: { clerkId: userId } });
    // if (!user?.isAdmin) { return NextResponse.json({ ok: false, error: 'Admin access required' }, { status: 403 }); }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Rune ID is required',
        },
        { status: 400 },
      );
    }

    // Check if rune exists
    const existingRune = await db.runeDef.findUnique({
      where: { id },
    });

    if (!existingRune) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Rune not found',
        },
        { status: 404 },
      );
    }

    // Check if rune is in use
    const userRunes = await db.userRune.findMany({
      where: { runeId: id },
    });

    if (userRunes.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Cannot delete rune that is assigned to users',
        },
        { status: 400 },
      );
    }

    // Delete the rune
    await db.runeDef.delete({
      where: { id },
    });

    // Update site config to invalidate cache
    await db.siteConfig.update({
      where: { id: 'singleton' },
      data: {
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    return NextResponse.json({
      ok: true,
      data: { message: 'Rune deleted successfully' },
    });
  } catch (error) {
    console.error('Rune delete error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}
