'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.stream = exports.logger = void 0;
const winston_1 = __importDefault(require('winston'));
const path_1 = __importDefault(require('path'));
// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};
// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};
// Add colors to Winston
winston_1.default.addColors(colors);
// Define the format for logs
const format = winston_1.default.format.combine(
  winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston_1.default.format.colorize({ all: true }),
  winston_1.default.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);
// Define which transports to use based on environment
const transports = [
  // Console transport for all environments
  new winston_1.default.transports.Console(),
  // File transport for production
  ...(env.NODE_ENV === 'production'
    ? [
        new winston_1.default.transports.File({
          filename: path_1.default.join('logs', 'error.log'),
          level: 'error',
        }),
        new winston_1.default.transports.File({
          filename: path_1.default.join('logs', 'combined.log'),
        }),
      ]
    : []),
];
// Create the logger instance
exports.logger = winston_1.default.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  format,
  transports,
});
// Create a stream object for Morgan
exports.stream = {
  write: message => {
    exports.logger.http(message.trim());
  },
};
