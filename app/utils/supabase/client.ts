import { createClient } from '@supabase/supabase-js';
import { env } from '../../env';

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create Supabase client if environment variables are available
export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  return { error: 'Database error occurred' };
};
