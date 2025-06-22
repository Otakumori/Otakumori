import { createClient } from '@supabase/supabase-js';
import { env } from '@/env';
import type { Database } from '@/types/supabase';

if (!env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}

if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase Error:', {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  });

  if (error.code === 'PGRST301') {
    throw new Error('Authentication required');
  } else if (error.code === 'PGRST302') {
    throw new Error('Permission denied');
  } else if (error.code === 'PGRST303') {
    throw new Error('Resource not found');
  } else {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Type-safe query helper
export const query = async <T>(queryFn: () => Promise<{ data: T | null; error: any }>) => {
  try {
    const { data, error } = await queryFn();
    if (error) handleSupabaseError(error);
    return data;
  } catch (error) {
    handleSupabaseError(error);
  }
};
