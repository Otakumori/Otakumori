import { NextResponse } from 'next/server';

export function retiredMutationRoute(error: string, canonicalPath?: string) {
  return NextResponse.json(
    {
      ok: false,
      error,
      message: 'This mutation route is no longer available.',
      ...(canonicalPath ? { canonicalPath } : {}),
    },
    { status: 410 },
  );
}
