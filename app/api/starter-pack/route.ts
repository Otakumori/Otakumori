// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { appUrl } from '@/lib/canonical';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'email' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
    }

    // Store subscriber (upsert to avoid duplicates)
    try {
      await prisma.$executeRaw`
        INSERT INTO "Subscriber" ("email", "created_at") 
        VALUES (${email}, NOW()) 
        ON CONFLICT ("email") DO NOTHING
      `;
    } catch (dbError: unknown) {
      const error = dbError instanceof Error ? dbError : new Error(String(dbError));
      console.warn('Subscriber table operation failed (table may not exist):', error.message);
    }

    // Return the starter pack download URL
    const starterPackUrl = `${appUrl()}/api/starter-pack/download`;

    return NextResponse.json({
      url: starterPackUrl,
      message: 'Starter pack ready for download',
    });
  } catch (error) {
    console.error('Starter pack error:', error);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
