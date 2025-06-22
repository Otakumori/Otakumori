'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.RateLimitError =
  exports.NotFoundError =
  exports.AuthorizationError =
  exports.AuthenticationError =
  exports.ValidationError =
  exports.AppError =
    void 0;
exports.handleError = handleError;
class AppError extends Error {
  message;
  statusCode;
  code;
  details;
  constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'AppError';
  }
}
exports.AppError = AppError;
class ValidationError extends AppError {
  constructor(message, details) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends AppError {
  constructor(message = 'Not authorized') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}
exports.NotFoundError = NotFoundError;
class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}
exports.RateLimitError = RateLimitError;
function handleError(error) {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      details: error.details,
    };
  }
  console.error('Unhandled error:', error);
  return {
    statusCode: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  };
}
