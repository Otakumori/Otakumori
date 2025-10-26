/**
 * Age Verification API
 *
 * Sets or clears the HTTP-only om_age_ok cookie for NSFW content access.
 * This cookie is the server-side authoritative source for age verification.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { env } from '@/env';

export const runtime = 'nodejs';

/**
 * POST /api/policy/age
 *
 * Sets the om_age_ok cookie to "1" (age verified).
 * This cookie is HTTP-only and secure, preventing client-side tampering.
 *
 * @returns Success response
 */
export async function POST() {
  const cookieStore = await cookies();

  cookieStore.set({
    name: 'om_age_ok',
    value: '1',
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  return NextResponse.json({ ok: true, message: 'Age verification set' });
}

/**
 * DELETE /api/policy/age
 *
 * Clears the om_age_ok cookie (revoke age verification).
 *
 * @returns Success response
 */
export async function DELETE() {
  const cookieStore = await cookies();

  cookieStore.delete('om_age_ok');

  return NextResponse.json({ ok: true, message: 'Age verification cleared' });
}
