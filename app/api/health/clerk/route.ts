import { NextResponse} from "next/server";

export async function GET() {
  const ok = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY;
  return NextResponse.json({ ok }, { status: ok ? 200 : 500 });
}
