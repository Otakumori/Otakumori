/**
 * Generate unique request IDs for tracing and debugging
 */

export function generateRequestId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `otm_${timestamp}_${random}`;
}

export function parseRequestId(requestId: string): { timestamp: number; random: string } | null {
  const match = requestId.match(/^otm_(\d+)_(.+)$/);
  if (!match) return null;

  return {
    timestamp: parseInt(match[1], 10),
    random: match[2],
  };
}

export function isRequestIdValid(requestId: string): boolean {
  return parseRequestId(requestId) !== null;
}
