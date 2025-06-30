import { createClient } from '@supabase/supabase-js';
import { env } from './env';

export const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL || '',
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: false, // Disable session persistence on server
      autoRefreshToken: false, // Disable token refresh on server
    },
    realtime: {
      params: {
        eventsPerSecond: 0, // Disable realtime on server
      },
    },
  }
);
