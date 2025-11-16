/**
 * Admin Configuration
 * 
 * Centralized admin access control configuration.
 * Only users with emails in ADMIN_EMAILS can access /admin routes.
 */

export const ADMIN_EMAILS = [
  'ap1903@hotmail.com',
  'adi@otaku-mori.com',
] as const;

/**
 * Check if an email is an admin email
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase() as (typeof ADMIN_EMAILS)[number]);
}

