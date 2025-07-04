import { env } from '../../app/env';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create Supabase client with fallback handling
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    ...(typeof window !== 'undefined' && {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    }),
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
