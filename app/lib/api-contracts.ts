import { z } from 'zod';

// Base API Response Types
export interface ApiSuccess<T = any> {
  ok: true;
  data: T;
  requestId: string;
}

export interface ApiError {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  requestId: string;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

// Error Codes
export const API_ERROR_CODES = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  FORBIDDEN: 'FORBIDDEN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  IDEMPOTENCY_KEY_REQUIRED: 'IDEMPOTENCY_KEY_REQUIRED',
  IDEMPOTENCY_KEY_INVALID: 'IDEMPOTENCY_KEY_INVALID',
} as const;

// Request Validation Schemas
export const IdempotencyKeySchema = z.string().min(1).max(100);
export const RequestIdSchema = z.string().uuid();

// Pagination
export interface PaginationParams {
  cursor?: string;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
}

// Common Validation Schemas
export const EmailSchema = z.string().email().max(255);
export const DisplayNameSchema = z.string().min(1).max(100).trim();
export const UsernameSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[a-zA-Z0-9_-]+$/);
export const ContentSchema = z.string().min(1).max(280).trim();

// Soapstone Schemas
export const SoapstoneCreateSchema = z.object({
  body: ContentSchema,
  x: z.number().optional(),
  y: z.number().optional(),
});

export const SoapstoneResponseSchema = z.object({
  id: z.string(),
  text: z.string(),
  createdAt: z.string(),
  appraises: z.number(),
  user: z.object({
    id: z.string(),
    display_name: z.string().nullable(),
    avatarUrl: z.string().nullable(),
  }),
});

// Praise Schemas
export const PraiseCreateSchema = z.object({
  receiverId: z.string().min(1),
});

export const PraiseResponseSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  receiverId: z.string(),
  dayKey: z.string(),
  createdAt: z.string(),
});

// Wishlist Schemas
export const WishlistToggleSchema = z.object({
  productId: z.string().min(1),
});

export const WishlistItemResponseSchema = z.object({
  id: z.string(),
  productId: z.string(),
  createdAt: z.string(),
});

// Game Save Schemas
export const GameSaveCreateSchema = z.object({
  gameId: z.string().min(1),
  slot: z.number().int().min(0).max(2),
  payload: z.any(), // JSONB data
  saveVersion: z.number().int().default(1),
});

export const GameSaveResponseSchema = z.object({
  id: z.string(),
  gameId: z.string(),
  slot: z.number(),
  payload: z.any(),
  saveVersion: z.number(),
  updatedAt: z.string(),
});

// Rate Limiting
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator: (req: Request) => string;
}

export const RATE_LIMITS: Record<
  string,
  { windowMs: number; maxRequests: number; message?: string }
> = {
  SOAPSTONE_PLACE: {
    windowMs: 60000,
    maxRequests: 5,
    message: 'Too many soapstone messages. Please wait before posting again.',
  },
  PRAISE_SEND: {
    windowMs: 86400000,
    maxRequests: 10,
    message: 'Daily praise limit reached. Come back tomorrow!',
  },
  WISHLIST_TOGGLE: {
    windowMs: 60000,
    maxRequests: 20,
    message: 'Too many wishlist changes. Please slow down.',
  },
  TRADE_OFFER: {
    windowMs: 300000,
    maxRequests: 3,
    message: 'Too many trade offers. Please wait before offering again.',
  },
  GAME_SAVE: {
    windowMs: 10000,
    maxRequests: 10,
    message: 'Too many save attempts. Please wait a moment.',
  },
  DEFAULT: {
    windowMs: 60000,
    maxRequests: 30,
    message: 'Rate limit exceeded. Please try again later.',
  },
};

// Utility Functions
export function generateRequestId(): string {
  return crypto.randomUUID();
}

export function createApiSuccess<T>(data: T, requestId: string): ApiSuccess<T> {
  return {
    ok: true,
    data,
    requestId,
  };
}

export function createApiError(
  code: keyof typeof API_ERROR_CODES,
  message: string,
  requestId: string,
  details?: any,
): ApiError {
  return {
    ok: false,
    error: {
      code: API_ERROR_CODES[code],
      message,
      details,
    },
    requestId,
  };
}

// Validation Helper
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
