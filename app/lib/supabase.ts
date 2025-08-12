import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
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
