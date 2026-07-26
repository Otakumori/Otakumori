import 'server-only';

import { headers } from 'next/headers';

import { FALLBACK_APP_ORIGIN, STAGING_APP_ORIGIN } from '@/app/lib/auth/accountUrls';

const LOCAL_APP_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);
const STAGING_APP_HOST = new URL(STAGING_APP_ORIGIN).hostname;

type RuntimeProcess = {
  env?: Record<string, string | undefined>;
};

function readRuntimeEnv(key: string) {
  const runtimeProcess = (globalThis as typeof globalThis & { process?: RuntimeProcess }).process;
  return runtimeProcess?.env?.[key];
}

function hasExplicitPort(raw: string) {
  const withoutProtocol = raw.replace(/^[a-z][a-z\d+.-]*:\/\//i, '');
  const authority = withoutProtocol.split(/[/?#]/, 1)[0] ?? '';
  return /:\d+$/.test(authority);
}

function normalizeVercelPreviewOrigin(candidate?: string) {
  if (!candidate) return null;

  try {
    const raw = candidate.trim();
    if (!raw) return null;
    if (hasExplicitPort(raw)) return null;

    const parsed = new URL(raw.includes('://') ? raw : `https://${raw}`);
    const hasRouteParts = parsed.pathname !== '/' || parsed.search !== '' || parsed.hash !== '';
    const hasCredentials = parsed.username !== '' || parsed.password !== '';

    if (
      parsed.protocol !== 'https:' ||
      hasRouteParts ||
      hasCredentials ||
      parsed.port !== '' ||
      !parsed.hostname.endsWith('.vercel.app')
    ) {
      return null;
    }

    return parsed.origin;
  } catch {
    return null;
  }
}

function normalizeLocalOrigin(hostHeader: string | null, protoHeader: string | null) {
  if (!hostHeader) return null;

  try {
    const protocol = protoHeader === 'https' ? 'https' : 'http';
    const parsed = new URL(`${protocol}://${hostHeader}`);

    if (!LOCAL_APP_HOSTS.has(parsed.hostname)) return null;
    if (
      parsed.username ||
      parsed.password ||
      parsed.pathname !== '/' ||
      parsed.search ||
      parsed.hash
    ) {
      return null;
    }

    return parsed.origin;
  } catch {
    return null;
  }
}

function firstHeaderValue(value: string | null) {
  return value?.split(',')[0]?.trim() || null;
}

function normalizeStagingPreviewOrigin(hostHeader: string | null, protoHeader: string | null) {
  const host = firstHeaderValue(hostHeader)?.toLowerCase();
  const protocol = firstHeaderValue(protoHeader)?.toLowerCase();

  if (host === STAGING_APP_HOST && protocol === 'https') {
    return STAGING_APP_ORIGIN;
  }

  return null;
}

export async function resolveServerAppOrigin() {
  const vercelEnv = readRuntimeEnv('VERCEL_ENV') ?? readRuntimeEnv('VERCEL_ENVIRONMENT');

  if (vercelEnv === 'production') {
    return FALLBACK_APP_ORIGIN;
  }

  const requestHeaders = await headers();

  if (vercelEnv === 'preview') {
    return (
      normalizeStagingPreviewOrigin(
        requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host'),
        requestHeaders.get('x-forwarded-proto') ?? requestHeaders.get('x-forwarded-protocol'),
      ) ??
      normalizeVercelPreviewOrigin(readRuntimeEnv('VERCEL_BRANCH_URL')) ??
      normalizeVercelPreviewOrigin(readRuntimeEnv('VERCEL_URL')) ??
      FALLBACK_APP_ORIGIN
    );
  }

  return (
    normalizeLocalOrigin(
      requestHeaders.get('host'),
      requestHeaders.get('x-forwarded-proto') ?? requestHeaders.get('x-forwarded-protocol'),
    ) ?? FALLBACK_APP_ORIGIN
  );
}

export const serverAppOriginTestInternals = {
  normalizeVercelPreviewOrigin,
  normalizeLocalOrigin,
  normalizeStagingPreviewOrigin,
};
