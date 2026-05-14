#!/usr/bin/env node

const baseUrl = normalizeBaseUrl(
  process.env.BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
);

const routes = ['/', '/shop', '/blog', '/api/v1/cart', '/api/health'];

let failures = 0;

for (const route of routes) {
  const url = new URL(route, baseUrl);

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      headers: {
        accept: route.startsWith('/api/') ? 'application/json' : 'text/html,application/xhtml+xml',
        'user-agent': 'otakumori-smoke/1.0',
      },
    });

    if (response.status === 200) {
      console.log(`PASS ${route} ${response.status}`);
      continue;
    }

    failures += 1;
    console.error(`FAIL ${route} ${response.status}`);
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
