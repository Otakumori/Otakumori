/**
 * Client Error Logging Endpoint
 *
 * This endpoint receives client-side error reports and logs them server-side.
 * It may later be wired to Sentry or another external error tracking provider.
 *
 * TODO: Consider migrating to Sentry client-side SDK for better error tracking
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Zod schema for client error payload validation
const ClientErrorPayloadSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  stack: z.string().optional(),
  meta: z.unknown().optional(),
  type: z.string().optional(),
  timestamp: z.string().optional(),
  userAgent: z.string().optional(),
  url: z.string().optional(),
  // Support for different error types from call sites
  error: z
    .object({
      message: z.string(),
      stack: z.string().optional(),
      name: z.string().optional(),
    })
    .optional(),
  errorInfo: z
    .object({
      componentStack: z.string().optional(),
    })
    .optional(),
  filename: z.string().optional(),
  lineno: z.number().optional(),
  colno: z.number().optional(),
  reason: z.string().optional(),
  args: z.array(z.string()).optional(),
});

type ClientErrorPayload = z.infer<typeof ClientErrorPayloadSchema>;

/**
 * POST /api/log-client-error
 *
 * Receives client-side error reports and logs them safely.
 * Returns { ok: true } on success, { ok: false, error: string } on failure.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ ok: false, error: 'Invalid JSON payload' }, { status: 400 });
    }

    // Validate payload
    const validationResult = ClientErrorPayloadSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { ok: false, error: 'Invalid payload format', details: validationResult.error.errors },
        { status: 400 },
      );
    }

    const payload: ClientErrorPayload = validationResult.data;

    // Extract error message safely
    const errorMessage =
      payload.message || payload.error?.message || payload.reason || 'Unknown error';

    // Build safe log entry (no secrets, sanitized)
    const logEntry = {
      type: payload.type || 'client-error',
      message: errorMessage,
      stack: payload.stack || payload.error?.stack,
      timestamp: payload.timestamp || new Date().toISOString(),
      url: payload.url,
      userAgent: payload.userAgent,
      // Include structured error info if available
      errorInfo: payload.errorInfo,
      filename: payload.filename,
      lineno: payload.lineno,
      colno: payload.colno,
    };

    // Log to console with structured format
    console.error('[ClientError]', JSON.stringify(logEntry, null, 2));

    // Return success response
    return NextResponse.json({ ok: true });
  } catch (error) {
    // Log parsing/processing errors but don't expose details to client
    console.error('[CLIENT-ERROR-API] Failed to process error log:', error);

    return NextResponse.json({ ok: false, error: 'Failed to process error log' }, { status: 500 });
  }
}
