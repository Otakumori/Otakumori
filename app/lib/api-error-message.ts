const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';

export function normalizeApiErrorMessage(value: unknown, fallback = DEFAULT_ERROR_MESSAGE) {
  if (typeof value === 'string') return value.slice(0, 240);
  if (!value || typeof value !== 'object') return fallback;

  const error = value as { message?: unknown; code?: unknown };
  if (typeof error.message === 'string' && error.message.trim()) {
    return error.message.trim().slice(0, 240);
  }
  if (typeof error.code === 'string' && error.code.trim()) {
    return error.code.trim().replace(/_/g, ' ').toLowerCase().slice(0, 240);
  }

  return fallback;
}
