import { logger } from '@/app/lib/logger';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extract request body
    const body = await request.json().catch(() => ({}));
    const content = body.content as string;
    const parentId = body.parentId as string | undefined;
    
    const { getToken } = await auth();
    const token = await getToken({ template: 'otakumori-jwt' });

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const soapstoneId = params.id;

    // Log reply for debugging (use content and parentId if provided)
    logger.warn('Soapstone reply requested for ID:', undefined, { 
      value: soapstoneId,
      hasContent: !!content,
      hasParentId: !!parentId,
    });

    // In production, this would:
    // 1. Find the soapstone by ID
    // 2. Create a reply record
    // 3. Increment the glow level
    // 4. Update the soapstone's reply count

    // For demo purposes, return success
    return NextResponse.json({
      success: true,
      message: 'Reply added successfully',
      glowLevel: Math.floor(Math.random() * 5) + 1, // Random glow increase
    });
  } catch (error) {
    logger.error(
      'Error replying to soapstone:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json({ error: 'Failed to reply' }, { status: 500 });
  }
}
