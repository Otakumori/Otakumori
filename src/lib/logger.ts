import { env } from '@/env';

export interface LogContext {
  requestId?: string;
  userId?: string;
  service?: string;
  operation?: string;
  [key: string]: unknown;
}

class Logger {
  private generateRequestId(): string {
    return (
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const requestId = context?.requestId || this.generateRequestId();

    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  private log(level: string, message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage(level, message, context);

    if (env.NODE_ENV === 'production') {
      // In production, use structured logging
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: level.toUpperCase(),
          message,
          ...context,
        }),
      );
    } else {
      // In development, use human-readable format
      console.log(formattedMessage);
    }
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log('error', message, context);
  }

  debug(message: string, context?: LogContext): void {
    if (env.NODE_ENV === 'development') {
      this.log('debug', message, context);
    }
  }

  // API-specific logging helpers
  apiRequest(method: string, path: string, context?: LogContext): void {
    this.info(`API Request: ${method} ${path}`, {
      ...context,
      service: 'api',
      operation: 'request',
    });
  }

  apiResponse(method: string, path: string, status: number, context?: LogContext): void {
    const level = status >= 400 ? 'error' : 'info';
    this[level](`API Response: ${method} ${path} ${status}`, {
      ...context,
      service: 'api',
      operation: 'response',
    });
  }

  serviceCall(service: string, operation: string, success: boolean, context?: LogContext): void {
    const level = success ? 'info' : 'error';
    this[level](`Service Call: ${service}.${operation}`, {
      ...context,
      service,
      operation,
      success,
    });
  }
}

export const logger = new Logger();

// Export the Logger class as well
export { Logger };

// Helper function to create a request-scoped logger
export function createRequestLogger(requestId: string): Logger {
  const requestLogger = new Logger();
  return requestLogger;
}
