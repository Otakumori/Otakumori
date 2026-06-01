#!/usr/bin/env tsx

import { lookup } from 'node:dns/promises';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'dotenv';

type RedisDiagnostic = {
  status: 'pass' | 'fail';
  category: string;
  details: string[];
  action?: string;
};

const loadedEnvFiles: string[] = [];

for (const file of ['.env.local', '.env']) {
  const path = resolve(process.cwd(), file);
  if (!existsSync(path)) continue;

  const parsed = parse(readFileSync(path));
  for (const [key, value] of Object.entries(parsed)) {
    process.env[key] ??= value;
  }
  loadedEnvFiles.push(file);
}

const { env } = await import('@/env');

function normalizeBaseUrl(value: string | undefined) {
  return (value ?? '').trim().replace(/\/+$/, '');
}

function hasEdgeWhitespace(value: string | undefined) {
  return typeof value === 'string' && value !== value.trim();
}

async function canResolveHostname(hostname: string) {
  if (!hostname) return false;

  try {
    await lookup(hostname);
    return true;
  } catch {
    return false;
  }
}

function httpCategory(status: number) {
  if (status === 401) return 'HTTP_401';
  if (status === 403) return 'HTTP_403';
  if (status === 404) return 'HTTP_404';
  if (status >= 500) return 'HTTP_5XX';
  return `HTTP_${status}`;
}

function httpAction(status: number) {
  if (status === 401) return 'Use the REST token paired with the intended Upstash database.';
  if (status === 403) return 'Check token permissions and that the intended Upstash database is active.';
  if (status === 404) return 'Use the base HTTPS Upstash REST endpoint without /ping.';
  if (status >= 500) return 'Check Upstash service status and the intended database health.';
  return 'Check the REST URL/token pairing from the intended long-lived Upstash database.';
}

async function parsePingResponse(response: Response): Promise<RedisDiagnostic | null> {
  const body = await response.text();

  try {
    const parsed = JSON.parse(body) as { result?: unknown };
    if (parsed?.result === 'PONG') return null;

    return {
      status: 'fail',
      category: 'UNEXPECTED_RESPONSE',
      details: [`status=${response.status}`, 'json=true', `hasResult=${'result' in parsed}`],
      action: 'Confirm the REST URL points to an Upstash Redis REST endpoint.',
    };
  } catch {
    if (body.trim() === 'PONG') return null;

    return {
      status: 'fail',
      category: 'INVALID_JSON_OR_UNEXPECTED_RESPONSE',
      details: [`status=${response.status}`, 'json=false'],
      action: 'Confirm the REST URL points to an Upstash Redis REST endpoint.',
    };
  }
}

async function diagnoseRedis(): Promise<RedisDiagnostic> {
  const rawUrl = process.env.UPSTASH_REDIS_REST_URL;
  const rawToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const urlFromEnv = env.UPSTASH_REDIS_REST_URL;
  const tokenFromEnv = env.UPSTASH_REDIS_REST_TOKEN;

  if (!urlFromEnv) {
    return {
      status: 'fail',
      category: 'URL_MISSING',
      details: [`hasUrl=${Boolean(urlFromEnv)}`, `hasToken=${Boolean(tokenFromEnv)}`],
      action: 'Set UPSTASH_REDIS_REST_URL to the HTTPS Upstash REST endpoint.',
    };
  }

  if (!tokenFromEnv) {
    return {
      status: 'fail',
      category: 'TOKEN_MISSING',
      details: [`hasUrl=${Boolean(urlFromEnv)}`, `hasToken=${Boolean(tokenFromEnv)}`],
      action: 'Set UPSTASH_REDIS_REST_TOKEN to the REST token paired with this database.',
    };
  }

  const baseUrl = normalizeBaseUrl(urlFromEnv);
  let parsed: URL;

  try {
    parsed = new URL(baseUrl);
  } catch {
    return {
      status: 'fail',
      category: 'INVALID_URL',
      details: ['urlParses=false'],
      action: 'Set UPSTASH_REDIS_REST_URL to a valid HTTPS URL.',
    };
  }

  if (parsed.protocol === 'redis:' || parsed.protocol === 'rediss:') {
    return {
      status: 'fail',
      category: 'URL_NOT_HTTPS',
      details: [`protocol=${parsed.protocol.replace(':', '')}`],
      action: 'Use the HTTPS REST endpoint, not the Redis protocol endpoint.',
    };
  }

  if (parsed.protocol !== 'https:') {
    return {
      status: 'fail',
      category: 'URL_NOT_HTTPS',
      details: [`protocol=${parsed.protocol.replace(':', '')}`],
      action: 'Use the HTTPS Upstash REST endpoint.',
    };
  }

  if (rawUrl?.trim().replace(/\/+$/, '').endsWith('/ping')) {
    return {
      status: 'fail',
      category: 'URL_INCLUDES_PING',
      details: ['containsPing=true'],
      action: 'Set UPSTASH_REDIS_REST_URL to the base REST URL only.',
    };
  }

  if (baseUrl.includes(tokenFromEnv.trim())) {
    return {
      status: 'fail',
      category: 'URL_CONTAINS_TOKEN',
      details: ['urlContainsToken=true'],
      action: 'Keep the token only in UPSTASH_REDIS_REST_TOKEN.',
    };
  }

  if (hasEdgeWhitespace(rawUrl) || hasEdgeWhitespace(rawToken)) {
    return {
      status: 'fail',
      category: 'EDGE_WHITESPACE',
      details: [
        `urlHasEdgeWhitespace=${hasEdgeWhitespace(rawUrl)}`,
        `tokenHasEdgeWhitespace=${hasEdgeWhitespace(rawToken)}`,
      ],
      action: 'Trim leading and trailing whitespace from both Redis env values.',
    };
  }

  try {
    const response = await fetch(`${baseUrl}/ping`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenFromEnv}`,
      },
    });

    if (!response.ok) {
      return {
        status: 'fail',
        category: httpCategory(response.status),
        details: [`status=${response.status}`, 'endpoint=/ping'],
        action: httpAction(response.status),
      };
    }

    const bodyFailure = await parsePingResponse(response);
    if (bodyFailure) return bodyFailure;

    return {
      status: 'pass',
      category: 'PASS',
      details: ['endpoint=/ping', 'method=GET', 'mutatesKeys=false'],
    };
  } catch (error) {
    const dnsResolves = await canResolveHostname(parsed.hostname);
    const isFetchFailed = error instanceof Error && error.message === 'fetch failed';

    return {
      status: 'fail',
      category: isFetchFailed ? 'FETCH_FAILED' : 'UNKNOWN',
      details: [
        `urlParses=true`,
        `protocol=${parsed.protocol.replace(':', '')}`,
        `hostnamePresent=${Boolean(parsed.hostname)}`,
        `hostnameMalformed=${!parsed.hostname}`,
        `dnsResolves=${dnsResolves}`,
        `envSource=${loadedEnvFiles.length > 0 ? loadedEnvFiles.join('+') : 'process'}`,
      ],
      action: 'Refresh the REST URL and REST token from the intended long-lived Upstash database.',
    };
  }
}

const result = await diagnoseRedis();

console.log('[Redis] Upstash REST diagnostics');
console.log(`status=${result.status}`);
console.log(`category=${result.category}`);
for (const detail of result.details) {
  console.log(detail);
}
if (result.action) {
  console.log(`action=${result.action}`);
}

process.exit(result.status === 'pass' ? 0 : 1);
