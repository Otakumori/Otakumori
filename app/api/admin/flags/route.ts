import type { NextRequest } from 'next/server';
import {
  GET as getPersistedFlags,
  POST as updatePersistedFlag,
} from '@/app/api/v1/admin/feature-flags/route';

export const runtime = 'nodejs';

// Compatibility route. The persisted v1 handler is the only active flag authority.
export async function GET() {
  return getPersistedFlags();
}

export async function POST(request: NextRequest) {
  return updatePersistedFlag(request);
}
