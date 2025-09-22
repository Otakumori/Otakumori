import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client helpers.
 * - Browser: pass a Clerk session token (template: 'supabase') to enforce RLS.
 * - Server: prefer service role key only in trusted server contexts.
 */

import { env } from '@/env.mjs';

export function createBrowserSupabase(accessToken?: string): SupabaseClient {
  const url = env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const options: any = { auth: { persistSession: false } };
  if (accessToken) {
    options.global = { headers: { Authorization: `Bearer ${accessToken}` } };
  }
  return createClient(url, anon, options);
}

export function createServerSupabase(opts?: {
  useServiceRole?: boolean;
  accessToken?: string;
}): SupabaseClient {
  const url = env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = opts?.useServiceRole
    ? env.SUPABASE_SERVICE_ROLE_KEY || ''
    : env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const options: any = { auth: { persistSession: false } };
  if (opts?.accessToken) {
    options.global = { headers: { Authorization: `Bearer ${opts.accessToken}` } };
  }
  return createClient(url, key, options);
}
