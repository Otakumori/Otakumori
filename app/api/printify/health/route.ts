import { NextResponse} from "next/server";

export const revalidate = 300; // 5 min

export async function GET() {
  const ok = !!process.env.PRINTIFY_API_KEY && !!process.env.PRINTIFY_SHOP_ID;
  return NextResponse.json({ ok }, { status: ok ? 200 : 500 });
}
