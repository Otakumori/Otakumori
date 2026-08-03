
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import {
  AuthenticationRequiredError,
  isMissingSchemaError,
  LocalUserUnavailableError,
  requireLocalViewer,
  schemaUnavailableResponse,
} from '@/app/lib/auth/viewer';
import { generateRequestId } from '@/lib/requestId';
export const runtime = 'nodejs';

export async function PATCH(req: Request) {
  const requestId = generateRequestId();

  try {
    const viewer = await requireLocalViewer();
    const { displayName } = (await req.json()) as { displayName: unknown };

    if (typeof displayName !== 'string') {
      return NextResponse.json({ ok: false, error: 'Invalid display name' }, { status: 400 });
    }

    await prisma.user.update({ where: { id: viewer.localUserId }, data: { displayName } });
    return NextResponse.json({ ok: true, data: { updated: true } });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof LocalUserUnavailableError || isMissingSchemaError(error)) {
      return NextResponse.json(schemaUnavailableResponse(requestId), { status: 503 });
    }

    return NextResponse.json({ ok: false, error: 'Failed to update display name', requestId }, { status: 500 });
  }
}
