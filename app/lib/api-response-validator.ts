/**
 * API Response Validation Utilities
 *
 * Ensures all API responses match expected schemas before being used in Server Components.
 * This prevents Server Component render errors from malformed API data.
 */

import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';
import { z } from 'zod';
import { type ApiResponse, type ApiSuccess, type ApiError } from './api-contracts';

/**
 * Validates an API response against a schema and returns type-safe data or error.
 *
 * @param response - The API response to validate
 * @param schema - Zod schema for the response data
 * @returns Validated data or null if validation fails
 *
 * @example
 * ```typescript
 * const result = await safeFetch('/api/v1/products/featured');
 * const products = validateApiResponse(result, ProductsResponseSchema);
 * if (products) {
 *   // Type-safe access to products
 * }
 * ```
 */
export function validateApiResponse<T>(response: unknown, schema: z.ZodSchema<T>): T | null {
  try {
    const validated = schema.safeParse(response);
    if (validated.success) {
      return validated.data;
    }

    logger.warn('[API Response Validator] Validation failed:', undefined, {
      error: validated.error,
      response:
        typeof response === 'object' ? JSON.stringify(response).substring(0, 200) : response,
    });

    return null;
  } catch (error) {
    logger.error('[API Response Validator] Unexpected error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

/**
 * Validates an API envelope response (with ok/data/error structure).
 *
 * @param response - The API envelope response
 * @param dataSchema - Zod schema for the data field (when ok: true)
 * @returns Validated success response or null if validation fails
 *
 * @example
 * ```typescript
 * const result = await safeFetch('/api/v1/products/featured');
 * const validated = validateApiEnvelope(result, ProductsDataSchema);
 * if (validated?.ok) {
 *   // Type-safe access to validated.data
 * }
 * ```
 */
export function validateApiEnvelope<T>(
  response: unknown,
  dataSchema: z.ZodSchema<T>,
): ApiSuccess<T> | null {
  // First validate it's an API envelope
  const EnvelopeSchema = z.object({
    ok: z.boolean(),
    requestId: z.string().optional(),
  });

  const envelopeCheck = EnvelopeSchema.safeParse(response);
  if (!envelopeCheck.success) {
    logger.warn('[API Response Validator] Not a valid API envelope:', undefined, { value: envelopeCheck.error });
    return null;
  }

  const envelope = response as ApiResponse<T>;

  if (!envelope.ok) {
    // Error response - log but don't fail validation
    const error = envelope as ApiError;
    logger.warn('[API Response Validator] API returned error:', undefined, {
      code: error.error.code,
      message: error.error.message,
      requestId: error.requestId,
    });
    return null;
  }

  // Validate the data field
  const success = envelope as ApiSuccess<T>;
  const dataValidation = dataSchema.safeParse(success.data);

  if (!dataValidation.success) {
    logger.warn('[API Response Validator] Data validation failed:', undefined, {
      error: dataValidation.error,
      requestId: success.requestId,
    });
    return null;
  }

  return {
    ok: true,
    data: dataValidation.data,
    requestId: success.requestId,
  };
}

/**
 * Safely extracts data from an API response with validation and fallback.
 *
 * @param response - The API response
 * @param schema - Zod schema for validation
 * @param fallback - Fallback value if validation fails
 * @returns Validated data or fallback
 *
 * @example
 * ```typescript
 * const result = await safeFetch('/api/v1/products/featured');
 * const products = safeExtractData(
 *   result,
 *   ProductsArraySchema,
 *   [] // Empty array fallback
 * );
 * ```
 */
export function safeExtractData<T>(response: unknown, schema: z.ZodSchema<T>, fallback: T): T {
  const validated = validateApiResponse(response, schema);
  return validated ?? fallback;
}

/**
 * Type guard to check if response is a successful API envelope.
 */
export function isApiSuccess<T>(response: unknown): response is ApiSuccess<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'ok' in response &&
    (response as ApiResponse).ok === true &&
    'data' in response
  );
}

/**
 * Type guard to check if response is an API error envelope.
 */
export function isApiError(response: unknown): response is ApiError {
  return (
    typeof response === 'object' &&
    response !== null &&
    'ok' in response &&
    (response as ApiResponse).ok === false &&
    'error' in response
  );
}
