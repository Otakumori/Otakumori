/**
 * Generate a unique request ID for tracing and debugging
 * Format: otm_${timestamp}_${random}
 */
export function generateRequestId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `otm_${timestamp}_${random}`;
}
