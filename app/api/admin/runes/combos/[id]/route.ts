// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

// DELETE: Delete a rune combo
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
          error: 'Combo ID is required',
        },
        { status: 400 },
      );
    }

    // Check if combo exists
    const existingCombo = await db.runeCombo.findUnique({
      where: { id },
    });

    if (!existingCombo) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Combo not found',
        },
        { status: 404 },
      );
    }

    // Delete the combo
    await db.runeCombo.delete({
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
      data: { message: 'Combo deleted successfully' },
    });
  } catch (error) {
    console.error('Combo delete error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}
