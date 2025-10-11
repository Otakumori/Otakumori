// DEPRECATED: This component is a duplicate. Use app\lib\logger.ts instead.
export function log(event: string, data?: Record<string, unknown>) {
  const entry = { ts: new Date().toISOString(), event, ...data };
  // Log entry to console for backwards compatibility
  console.log('[DEPRECATED Logger]', entry);

  // TODO: Remove this file and update all imports to use app/lib/logger.ts
}
