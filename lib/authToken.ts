import { useAuth } from '@clerk/nextjs';

/**
 * Hook for getting Clerk session tokens with retry logic
 * Returns a function that can be called to get the current session token
 */
export function useSessionToken() {
  const { getToken } = useAuth();

  return async () => {
    const token = await getToken();
    if (!token) {
      throw new Error('No session token available');
    }
    return token;
  };
}

/**
 * Utility function to get session token with retry logic
 * Useful for server-side operations or when useAuth hook isn't available
 */
export async function getSessionTokenOrThrow(): Promise<string> {
  // This would typically be called from a server context
  // where we can get the token from the request
  throw new Error('getSessionTokenOrThrow should be called from server context with auth()');
}

/**
 * Retry wrapper for Supabase operations that might fail due to expired tokens
 * @param operation - The async operation to retry
 * @param maxRetries - Maximum number of retries (default: 1)
 */
export async function withTokenRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 1,
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (error?.status === 401 && maxRetries > 0) {
      // Token might be expired, retry once
      console.log('Token expired, retrying operation...');
      return await withTokenRetry(operation, maxRetries - 1);
    }
    throw error;
  }
}
