export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const ts = new Date().toISOString();
  const formattedMessage = `[${ts}] ${level.toUpperCase()}: ${message}`;

  // Use appropriate console method based on log level
  if (level === 'error') {
    console.error(formattedMessage, meta ?? {});
  } else {
    console.warn(formattedMessage, meta ?? {});
  }
}

export function reqId(headers: Headers): string | undefined {
  return headers.get('x-request-id') || headers.get('x-correlation-id') || undefined;
}
