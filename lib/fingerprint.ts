import { env } from '../env.mjs';
import { createHash } from 'crypto';

export interface FingerprintData {
  uaHash: string;
  ipHash: string;
  sessionId: string;
}

/**
 * Generate a secure hash of user agent and IP for rate limiting
 * Never exposes raw IP addresses to the client
 */
export function generateFingerprint(
  userAgent: string,
  ipAddress: string | null,
  sessionId: string,
): FingerprintData {
  const uaHash = createHash('sha256')
    .update(userAgent + env.PETAL_SALT)
    .digest('hex')
    .slice(0, 16);

  const ipHash = ipAddress
    ? createHash('sha256')
        .update(ipAddress + env.PETAL_SALT)
        .digest('hex')
        .slice(0, 16)
    : 'anonymous';

  return {
    uaHash,
    ipHash,
    sessionId,
  };
}

/**
 * Extract IP address from request headers (respects proxy headers)
 */
export function extractClientIP(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  // Cloudflare
  if (cfConnectingIP) {
    const [first] = cfConnectingIP.split(',');
    return first?.trim() || null;
  }

  // Standard proxy headers
  if (forwarded) {
    const [first] = forwarded.split(',');
    return first?.trim() || null;
  }

  if (realIP) {
    const [first] = realIP.split(',');
    return first?.trim() || null;
  }

  return null;
}

/**
 * Generate a unique guest session ID
 */
export function generateGuestSessionId(): string {
  return createHash('sha256')
    .update(Date.now().toString() + Math.random().toString() + env.PETAL_SALT)
    .digest('hex')
    .slice(0, 24);
}

/**
 * Validate session ID format
 */
export function isValidSessionId(sessionId: string): boolean {
  return /^[a-f0-9]{24}$/.test(sessionId);
}
