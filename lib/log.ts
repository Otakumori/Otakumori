export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const ts = new Date().toISOString();
  // eslint-disable-next-line no-console
  console[level](`[${ts}] ${message}`, meta ?? {});
}

export function reqId(headers: Headers): string | undefined {
  return headers.get('x-request-id') || headers.get('x-correlation-id') || undefined;
}
