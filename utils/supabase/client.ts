
import { createBrowserClient } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Browser client for client-side usage
export const createClient = () =>
  createBrowserClient(
    supabaseUrl!,
    supabaseKey!,
  );

// Server client for API routes
export const supabase = createBrowserClient(
  supabaseUrl!,
  supabaseKey!,
);

// Server client with cookies for SSR
export const createServerSupabaseClient = () => {
  const cookieStore = cookies();
  
  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};

// Error handler for Supabase operations
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  
  if (error?.code) {
    switch (error.code) {
      case 'PGRST116':
        throw new Error('Resource not found');
      case 'PGRST301':
        throw new Error('Invalid request');
      case 'PGRST302':
        throw new Error('Unauthorized');
      case 'PGRST303':
        throw new Error('Forbidden');
      default:
        throw new Error(error.message || 'Database operation failed');
    }
  }
  
  throw new Error(error.message || 'An unexpected error occurred');
};
