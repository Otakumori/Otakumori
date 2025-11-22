import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/env/server';

const DEFAULT_METHODS = 'GET,POST,PUT,PATCH,DELETE,OPTIONS';
const DEFAULT_HEADERS = 'Content-Type, Authorization, X-Requested-With, X-Request-ID';
const DEFAULT_ORIGINS = ['http://localhost:3000', 'https://localhost:3000'];

type AllowOriginEntry = {
  raw: string;
  normalized: string;
};

function normalizeOrigin(origin: string) {
  return origin.replace(/\/$/, '').toLowerCase();
}

function buildAllowList(): AllowOriginEntry[] {
  const fromEnv = (env.API_CORS_ALLOW_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const candidates = [
    ...fromEnv,
    env.NEXT_PUBLIC_APP_URL ?? '',
    env.NEXT_PUBLIC_SITE_URL ?? '',
    ...DEFAULT_ORIGINS,
  ].filter(Boolean);

  const unique = Array.from(new Set(candidates.map(normalizeOrigin)));

  return unique.map((normalized) => {
    const original =
      candidates.find((candidate) => normalizeOrigin(candidate) === normalized) ?? normalized;
    return { raw: original, normalized };
  });
}

const ALLOW_LIST = buildAllowList();
const HAS_WILDCARD = ALLOW_LIST.some((entry) => entry.normalized === '*');

function resolveAllowedOrigin(requestOrigin?: string | null): string {
  if (HAS_WILDCARD) {
    return '*';
  }

  if (requestOrigin) {
    const normalized = normalizeOrigin(requestOrigin);
    const match = ALLOW_LIST.find((entry) => entry.normalized === normalized);
    if (match) {
      return match.raw;
    }
  }

  return ALLOW_LIST[0]?.raw ?? 'null';
}

export function getCorsHeaders(requestOrigin?: string | null) {
  const allowOrigin = resolveAllowedOrigin(requestOrigin);
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': DEFAULT_METHODS,
    'Access-Control-Allow-Headers': DEFAULT_HEADERS,
    Vary: 'Origin',
  };

  if (allowOrigin !== '*') {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}

export function withCors(
  response: NextResponse,
  requestOrigin?: string | null,
  mergeHeaders: Record<string, string> = {},
) {
  const headers = {
    ...getCorsHeaders(requestOrigin),
    ...mergeHeaders,
  };

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export function handleCorsPreflight(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Max-Age', '600');
  return withCors(response, request.headers.get('origin'));
}
