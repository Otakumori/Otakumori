export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export type LogCtx = {
  requestId?: string | undefined;
  route?: string | undefined;
  userId?: string | undefined;
  game?: string | undefined;
  extra?: Record<string, unknown> | undefined;
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

  private normalizeUnknown(value: unknown): unknown {
    if (value instanceof Error) {
      return this.formatError(value);
    }

    return value;
  }

  private safeStringify(value: unknown): string {
    const seen = new WeakSet<object>();

    try {
      return JSON.stringify(value, (_key, nestedValue) => {
        if (typeof nestedValue === 'bigint') return nestedValue.toString();

        if (nestedValue instanceof Error) {
          return this.formatError(nestedValue);
        }

        if (typeof nestedValue === 'object' && nestedValue !== null) {
          if (seen.has(nestedValue)) return '[Circular]';
          seen.add(nestedValue);
        }

        return nestedValue;
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return JSON.stringify({
        ts: new Date().toISOString(),
        level: 'error',
        msg: 'Failed to serialize log entry',
        error: message,
      });
    }
  }

  private formatError(error: Error): LogEntry['error'] {
    const errorData: LogEntry['error'] = {
      name: error.name,
      message: error.message,
    };

    if (error.stack && this.isDevelopment) {
      errorData.stack = error.stack;
    }

    if (error.cause !== undefined) {
      errorData.cause = this.normalizeUnknown(error.cause);
    }

    return errorData;
  }

  private base(level: LogLevel, msg: string, ctx?: LogCtx, data?: unknown, error?: Error) {
    const entry: LogEntry = {
      ts: new Date().toISOString(),
      level,
      msg,
    };

    if (ctx?.requestId) entry.requestId = ctx.requestId;
    if (ctx?.route) entry.route = ctx.route;
    if (ctx?.userId) entry.userId = ctx.userId;
    if (ctx?.extra) entry.extra = ctx.extra;
    if (data !== undefined) entry.data = data;
    if (error) entry.error = this.formatError(error);

    const line = this.safeStringify(entry);

    // Important: never call logger.* from inside Logger.base(). That recurses.
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

      console.warn(`${prefix} ${timestamp}${routeInfo}${requestInfo} ${msg}`);

      if (data !== undefined) {
        console.warn(`${colors.debug}Data:${colors.reset}`, data);
      }

      if (error) {
        console.error(`${colors.error}Error:${colors.reset}`, error);
      }

      return;
    }

    // Production logging - structured JSON only.
    switch (level) {
      case 'error':
        console.error(line);
        break;
      case 'warn':
        console.warn(line);
        break;
      case 'debug':
        if (!this.isTest) console.warn(line);
        break;
      default:
        // Lint policy allows warn/error only; info logs are emitted as structured warnings.
        console.warn(line);
    }
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
