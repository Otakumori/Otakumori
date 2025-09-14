import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client helpers.
 * - Browser: pass a Clerk session token (template: 'supabase') to enforce RLS.
 * - Server: prefer service role key only in trusted server contexts.
 */

export function createBrowserSupabase(accessToken?: string): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const client = createClient(url, anon, { auth: { persistSession: false } });
  if (accessToken) client.auth.setAuth(accessToken);
  return client;
}

export function createServerSupabase(opts?: { useServiceRole?: boolean; accessToken?: string }): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = opts?.useServiceRole
    ? process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const client = createClient(url, key, { auth: { persistSession: false } });
  if (opts?.accessToken) client.auth.setAuth(opts.accessToken);
  return client;
}

