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

    const contextStr = context ? ` ${JSON.stringify({ ...context, requestId })}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  private log(level: string, message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage(level, message, context);

    if (env.NODE_ENV === 'production') {
      // In production, use structured logging
      console.warn(formattedMessage);
    } else {
      // In development, use human-readable format
      console.warn(formattedMessage);
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
    const requestId = context?.requestId || this.generateRequestId();
    this.info(`API Request: ${method} ${path}`, {
      ...context,
      requestId,
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

  // Wrap logger methods to automatically inject requestId
  const originalInfo = requestLogger.info.bind(requestLogger);
  const originalWarn = requestLogger.warn.bind(requestLogger);
  const originalError = requestLogger.error.bind(requestLogger);
  const originalDebug = requestLogger.debug.bind(requestLogger);

  requestLogger.info = (message: string, context?: LogContext) => {
    originalInfo(message, { ...context, requestId });
  };

  requestLogger.warn = (message: string, context?: LogContext) => {
    originalWarn(message, { ...context, requestId });
  };

  requestLogger.error = (message: string, context?: LogContext) => {
    originalError(message, { ...context, requestId });
  };

  requestLogger.debug = (message: string, context?: LogContext) => {
    originalDebug(message, { ...context, requestId });
  };

  return requestLogger;
}
