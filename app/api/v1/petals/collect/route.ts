import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { getToken } = await auth();
    const token = await getToken({ template: 'otakumori-jwt' });
    
    const body = await request.json();
    const { source, petalId } = body;

    // For now, return a success response
    // In production, this would update the user's petal count in the database
    const newTotal = Math.floor(Math.random() * 1000) + 100; // Demo total

    return NextResponse.json({
      ok: true,
      newTotal,
      message: 'Petal collected successfully!',
    });
  } catch (error) {
    console.error('Error collecting petal:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to collect petal' },
      { status: 500 }
    );
  }
}
