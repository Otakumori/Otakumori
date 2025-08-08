import { env } from '@/env';

export interface LogLevel {
  level: string;
  message: string;
  timestamp: string;
  data?: any;
}

class Logger {
  private logLevel: string;

  constructor() {
    this.logLevel = env.NODE_ENV === 'development' ? 'debug' : 'info';
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const logEntry: LogLevel = {
      level,
      message,
      timestamp,
      data,
    };
    return JSON.stringify(logEntry);
  }

  info(message: string, data?: any): void {
    console.log(this.formatMessage('info', message, data));
  }

  warn(message: string, data?: any): void {
    console.warn(this.formatMessage('warn', message, data));
  }

  error(message: string, data?: any): void {
    console.error(this.formatMessage('error', message, data));
  }

  debug(message: string, data?: any): void {
    if (this.logLevel === 'debug') {
      console.debug(this.formatMessage('debug', message, data));
    }
  }
}

export const logger = new Logger();
