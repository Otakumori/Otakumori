import { type NextRequest, NextResponse } from 'next/server';
import { paths } from '@/lib/paths';

/** Historical commerce destination; account itself remains hosted separately. */
export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL(paths.orders(), request.url), 307);
}
