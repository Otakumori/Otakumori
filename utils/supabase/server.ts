import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from '@/app/lib/env';

export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL || '',
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
};
