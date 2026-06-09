import { env } from '@/env';

/**
 * Admin Configuration
 *
 * Centralized admin access control configuration. ADMIN_EMAILS is the preferred
 * source of truth; the owner fallback preserves existing access during rollout.
 */

const OWNER_FALLBACK_ADMIN_EMAILS = ['ap1903@hotmail.com', 'adi@otaku-mori.com'] as const;

function parseAdminEmails(value: string | undefined) {
  return (value ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export const ADMIN_EMAILS = Array.from(
  new Set([...parseAdminEmails(env.ADMIN_EMAILS), ...OWNER_FALLBACK_ADMIN_EMAILS]),
);

/**
 * Check if an email is an admin email
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
