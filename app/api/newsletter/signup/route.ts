
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // TODO: Add newsletter signup to Prisma schema and implement proper storage
    // For now, just log the email and return success
    // Newsletter signup

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
