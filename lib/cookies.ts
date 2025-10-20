import { cookies } from 'next/headers';

/**
 * Safely set cookies by sanitizing values that contain truncating characters
 * Prevents CookieWithTruncatingChar warnings by removing \0, \r, \n
 */
export const setSafeCookie = async (name: string, value: string, opts: any = {}) => {
  // Sanitize cookie value by removing problematic characters
  const sanitizedValue = value.replace(/[\0\r\n]/g, '');

  return (await cookies()).set(name, sanitizedValue, {
    path: '/',
    ...opts,
  });
};

/**
 * Safely get cookies with fallback handling
 */
export const getSafeCookie = async (name: string): Promise<string | undefined> => {
  try {
    return (await cookies()).get(name)?.value;
  } catch {
    return undefined;
  }
};

/**
 * Safely delete cookies
 */
export const deleteSafeCookie = async (name: string) => {
  return (await cookies()).delete(name);
};
