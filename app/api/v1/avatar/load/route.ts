import type { NextRequest } from 'next/server';
import { GET as loadCanonicalAvatar } from '@/app/api/v1/creator/load/route';

/**
 * GET /api/v1/avatar/load
 * 
 * Compatibility projection of the canonical Creator read model.
 * Saved content preferences never confer adult authorization; renderer adapters remain SFW.
 */
export async function GET(request: NextRequest) {
  return loadCanonicalAvatar(request);
}

