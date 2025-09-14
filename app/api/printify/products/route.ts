import { type NextRequest, NextResponse } from 'next/server';
import { printifyService } from '@/app/lib/printify/service';

export const runtime = 'nodejs';
export const revalidate = 60;

export async function GET(_request: NextRequest) {
  // Use consolidated service; return raw array for test compatibility
  try {
    const { data, last_page } = await printifyService.getProducts(1, 100);
    return NextResponse.json(data ?? []);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 502 });
  }
}
