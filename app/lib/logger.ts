export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export type LogCtx = {
  requestId?: string;
  route?: string;
  userId?: string;
  extra?: Record<string, unknown>;
};

export interface LogEntry {
  ts: string;
  level: LogLevel;
  msg: string;
  requestId?: string;
  route?: string;
  userId?: string;
  extra?: Record<string, unknown>;
  data?: unknown;
  error?: {
    name: string;
    message: string;
    stack?: string;
    cause?: unknown;
  };
}

import { env } from '@/env.mjs';

class Logger {
  private isDevelopment = (env.NODE_ENV ?? 'development') === 'development';
  private isTest = (env.NODE_ENV ?? '') === 'test';

  private formatError(error: Error): LogEntry['error'] {
    return {
      name: error.name,
      message: error.message,
      stack: this.isDevelopment ? error.stack : undefined,
      cause: error.cause,
    };
  }

  private base(level: LogLevel, msg: string, ctx?: LogCtx, data?: unknown, error?: Error) {
    const entry: LogEntry = {
      ts: new Date().toISOString(),
      level,
      msg,
      requestId: ctx?.requestId,
      route: ctx?.route,
      userId: ctx?.userId,
      extra: ctx?.extra,
      data,
      ...(error && { error: this.formatError(error) }),
    };

    const line = JSON.stringify(entry);

    // In development, also log to console with colors
    if (this.isDevelopment) {
      const colors = {
        info: '\x1b[36m', // Cyan
        warn: '\x1b[33m', // Yellow
        error: '\x1b[31m', // Red
        debug: '\x1b[35m', // Magenta
        reset: '\x1b[0m', // Reset
      };

      const timestamp = new Date().toLocaleTimeString();
      const prefix = `${colors[level]}[${level.toUpperCase()}]${colors.reset}`;
      const routeInfo = ctx?.route ? ` ${colors.debug}[${ctx.route}]${colors.reset}` : '';
      const requestInfo = ctx?.requestId ? ` ${colors.debug}[${ctx.requestId}]${colors.reset}` : '';

      console.log(`${prefix} ${timestamp}${routeInfo}${requestInfo} ${msg}`);

      if (data) {
        console.log(`${colors.debug}Data:${colors.reset}`, data);
      }

      if (error) {
        console.error(`${colors.error}Error:${colors.reset}`, error);
      }
    } else {
      // Production logging - structured JSON only
      switch (level) {
        case 'error':
          console.error(line);
          break;
        case 'warn':
          console.warn(line);
          break;
        case 'debug':
          if (!this.isTest) console.debug(line);
          break;
        default:
          console.log(line);
      }
    }

    // TODO: In production, you might want to send to external logging service
    // like Sentry, LogRocket, or CloudWatch
  }

  info(msg: string, ctx?: LogCtx, data?: unknown) {
    this.base('info', msg, ctx, data);
  }

  warn(msg: string, ctx?: LogCtx, data?: unknown) {
    this.base('warn', msg, ctx, data);
  }

  error(msg: string, ctx?: LogCtx, data?: unknown, error?: Error) {
    this.base('error', msg, ctx, data, error);
  }

  debug(msg: string, ctx?: LogCtx, data?: unknown) {
    if (this.isDevelopment || this.isTest) {
      this.base('debug', msg, ctx, data);
    }
  }

  // Convenience methods for common logging patterns
  request(req: Request, msg: string, data?: unknown) {
    const requestId =
      req.headers.get('x-request-id') ||
      req.headers.get('x-correlation-id') ||
      `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.info(
      msg,
      {
        requestId,
        route: new URL(req.url).pathname,
        extra: { method: req.method, url: req.url },
      },
      data,
    );
  }

  apiError(req: Request, msg: string, error: Error, data?: unknown) {
    const requestId =
      req.headers.get('x-request-id') ||
      req.headers.get('x-correlation-id') ||
      `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.error(
      msg,
      {
        requestId,
        route: new URL(req.url).pathname,
        extra: { method: req.method, url: req.url },
      },
      data,
      error,
    );
  }

  userAction(userId: string, action: string, data?: unknown) {
    this.info(`User action: ${action}`, { userId }, data);
  }

  security(userId: string, action: string, data?: unknown) {
    this.warn(`Security event: ${action}`, { userId }, data);
  }

  performance(operation: string, duration: number, data?: unknown) {
    this.info(`Performance: ${operation}`, { extra: { duration, operation } }, data);
  }
}

export const logger = new Logger();

// Legacy export for backward compatibility
export const log = logger.info.bind(logger);
