
import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authorizeAdminApi } from '@/app/lib/auth/admin';

export const runtime = 'nodejs';

// DELETE: Delete a rune definition
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authorization = await authorizeAdminApi(request);
  if (!authorization.ok) return authorization.response;
  const userId = authorization.userId!;

  try {
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
    logger.error('Rune operation error', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}
