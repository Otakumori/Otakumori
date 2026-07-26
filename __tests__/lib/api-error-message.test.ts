import { describe, expect, it } from 'vitest';
import { normalizeApiErrorMessage } from '@/app/lib/api-error-message';

describe('normalizeApiErrorMessage', () => {
  it('turns structured API errors into strings', () => {
    expect(
      normalizeApiErrorMessage({
        code: 'SCHEMA_UNAVAILABLE',
        message: 'Wishlist is temporarily unavailable.',
      }),
    ).toBe('Wishlist is temporarily unavailable.');
  });

  it('does not return raw objects for React rendering', () => {
    const message = normalizeApiErrorMessage({ code: 'INTERNAL_ERROR' }, 'Fallback');

    expect(typeof message).toBe('string');
    expect(message).toBe('internal error');
  });
});
