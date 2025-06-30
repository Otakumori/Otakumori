import { createClient } from '@supabase/supabase-js';
import { env } from './env';

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Disable session persistence on server
    autoRefreshToken: false, // Disable token refresh on server
  },
  realtime: {
    params: {
      eventsPerSecond: 0, // Disable realtime on server
    },
  },
});
