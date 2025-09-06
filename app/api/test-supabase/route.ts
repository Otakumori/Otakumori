// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
// Disabled during Supabase to Prisma migration
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      error: 'Supabase test disabled during migration to Prisma',
    },
    { status: 503 },
  );
}
