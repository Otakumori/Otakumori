/**
 * Generate a unique request ID for API calls
 * Format: otm_${timestamp}_${random}
 */
export function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `otm_${timestamp}_${randomPart}`;
}

// Alias for backwards compatibility
export const newRequestId = generateRequestId;