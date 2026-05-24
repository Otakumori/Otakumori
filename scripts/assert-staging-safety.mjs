#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';

const envFiles = ['.env.local', '.env.preview.local', '.env.production.local'];

function parseEnvFile(path) {
  if (!existsSync(path)) return {};

  const parsed = {};
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    parsed[match[1]] = value;
  }

  return parsed;
}

const loaded = Object.assign(
  {},
  ...envFiles.map(parseEnvFile),
  process.env,
);

const stripeSecretKey = loaded.STRIPE_SECRET_KEY ?? '';
const stripePublishableKey = loaded.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';
const liveStripeDetected =
  stripeSecretKey.startsWith('sk_live_') || stripePublishableKey.startsWith('pk_live_');

if (liveStripeDetected) {
  console.error(
    'Refusing commerce release validation because Stripe is configured for live mode. '
      + 'Use a Preview/staging environment with sk_test/pk_test keys before running checkout validation.',
  );
  process.exit(1);
}

if (!stripeSecretKey && !stripePublishableKey) {
  console.warn(
    'Stripe keys were not available to the staging safety guard. '
      + 'This is acceptable for static route smoke, but not for checkout proof.',
  );
}

console.log('PASS staging safety guard: live Stripe keys not detected.');
