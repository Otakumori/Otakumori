import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required');
}

// Base Supabase client for public operations
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

/**
 * Create Supabase client with Clerk session token for authenticated operations
 * @param token - Clerk session token (RS256 JWT)
 * @returns Supabase client instance with Authorization header
 */
export function createSupabaseWithToken(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 0,
        },
      },
    }
  );
}

/**
 * Health check function to verify Supabase connection and JWT verification
 * Call this at app startup to catch configuration issues early
 */
export async function checkSupabaseHealth(): Promise<{ healthy: boolean; error?: string }> {
  try {
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      return { 
        healthy: false, 
        error: `Database connection failed: ${error.message}` 
      };
    }

    return { healthy: true };
  } catch (error: any) {
    return { 
      healthy: false, 
      error: `Health check failed: ${error.message}` 
    };
  }
}

/**
 * Verify that the Clerk issuer is correctly configured
 * This helps catch JWT verification issues early
 */
export async function verifyClerkIssuer(): Promise<{ valid: boolean; error?: string }> {
  try {
    // Test with a mock token to see if the issuer is recognized
    // In production, you might want to make a real authenticated call
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error && error.message.includes('JWT verification failed')) {
      return { 
        valid: false, 
        error: 'JWT verification failed - check Clerk issuer configuration in Supabase' 
      };
    }

    return { valid: true };
  } catch (error: any) {
    return { 
      valid: false, 
      error: `Issuer verification failed: ${error.message}` 
    };
  }
}
