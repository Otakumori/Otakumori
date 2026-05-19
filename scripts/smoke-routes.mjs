#!/usr/bin/env node

const baseUrl = normalizeBaseUrl(
  process.env.BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
);

const routes = parseRoutes(process.env.SMOKE_ROUTES) ?? [
  '/',
  '/shop',
  '/blog',
  '/api/v1/cart',
  '/api/health',
  '/shop/cart',
  '/shop/checkout',
];
const vercelProtectionBypass =
  process.env.VERCEL_AUTOMATION_BYPASS_SECRET || process.env.VERCEL_PROTECTION_BYPASS;

let failures = 0;

for (const route of routes) {
  const url = new URL(route, baseUrl);

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      headers: smokeHeaders(route),
    });

    if (response.status === 200) {
      console.log(`PASS ${route} ${response.status}`);
      continue;
    }

    failures += 1;
    console.error(`FAIL ${route} ${response.status}${explainFailure(response)}`);
  } catch (error) {
    failures += 1;
    const message = error instanceof Error ? error.message : String(error);
    console.error(`FAIL ${route} ${message}`);
  }
}

if (failures > 0) {
  console.error(`Smoke failed: ${failures} route(s) failed against ${baseUrl}`);
  process.exit(1);
}

console.log(`Smoke passed against ${baseUrl}`);

function normalizeBaseUrl(value) {
  const trimmed = value.trim().replace(/\/+$/, '');
  return trimmed || 'http://localhost:3000';
}

function parseRoutes(value) {
  if (!value) {
    return null;
  }

  const parsed = value
    .split(',')
    .map((route) => route.trim())
    .filter(Boolean);

  return parsed.length > 0 ? parsed : null;
}

function smokeHeaders(route) {
  const headers = {
    accept: route.startsWith('/api/') ? 'application/json' : 'text/html,application/xhtml+xml',
    'user-agent': 'otakumori-smoke/1.0',
  };

  if (vercelProtectionBypass) {
    headers['x-vercel-protection-bypass'] = vercelProtectionBypass;
  }

  return headers;
}

function explainFailure(response) {
  const server = response.headers.get('server');
  if (response.status === 401 && server?.toLowerCase().includes('vercel')) {
    return ' (Vercel Deployment Protection likely blocked the request; set VERCEL_AUTOMATION_BYPASS_SECRET or VERCEL_PROTECTION_BYPASS for smoke tests.)';
  }

  return '';
}
