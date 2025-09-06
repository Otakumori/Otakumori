// DEPRECATED: This component is a duplicate. Use app\lib\rateLimit.ts instead.
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { env } from '@/env.mjs';

class RateLimitError extends Error {
  constructor(message = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute

export async function rateLimit(request: NextRequest) {
  const ip = request.ip || 'unknown';
  const now = Date.now();

  const rateLimitInfo = rateLimitMap.get(ip);

  if (!rateLimitInfo || now > rateLimitInfo.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return;
  }

  if (rateLimitInfo.count >= MAX_REQUESTS) {
    throw new RateLimitError();
  }

  rateLimitInfo.count++;
}

export async function rateLimitMiddleware(request: NextRequest) {
  try {
    await rateLimit(request);
    return NextResponse.next();
  } catch (error) {
    if (error instanceof RateLimitError) {
      return new NextResponse('Rate limit exceeded', { status: 429 });
    }
    throw error;
  }
}
