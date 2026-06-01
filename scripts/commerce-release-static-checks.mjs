#!/usr/bin/env node

import { readFileSync } from 'node:fs';

const checks = [
  {
    name: 'WebhookEvent has provider/externalEventId unique constraint',
    file: 'prisma/schema.prisma',
    pattern: /model WebhookEvent[\s\S]*@@unique\(\[provider,\s*externalEventId\]\)/,
  },
  {
    name: 'Printify order sync is unique per local order',
    file: 'prisma/schema.prisma',
    pattern: /model PrintifyOrderSync[\s\S]*localOrderId\s+String\s+@unique/,
  },
  {
    name: 'Stripe webhook verifies raw body signature',
    file: 'app/api/webhooks/stripe/route.ts',
    pattern: /readRawBody\(req\)[\s\S]*stripe\.webhooks\.constructEvent\(raw,\s*sig,\s*secret\)/,
  },
  {
    name: 'Stripe webhook duplicate events return duplicate response',
    file: 'app/api/webhooks/stripe/route.ts',
    pattern: /beginWebhookProcessing\(event\)[\s\S]*duplicate:\s*true/,
  },
  {
    name: 'Fulfillment is called after checkout.session.completed handling unless dry-run guarded',
    file: 'app/api/webhooks/stripe/route.ts',
    pattern: /case 'checkout\.session\.completed'[\s\S]*isStripeWebhookFulfillmentDryRunEnabled\(\)[\s\S]*dry_run_skipped[\s\S]*createPrintifyOrder\(order\.id,\s*fullSession\)/,
  },
  {
    name: 'Stripe webhook fulfillment dry-run is server-env gated',
    file: 'env.mjs',
    pattern: /STRIPE_WEBHOOK_FULFILLMENT_DRY_RUN:\s*z\.string\(\)\.optional\(\)[\s\S]*STRIPE_WEBHOOK_FULFILLMENT_DRY_RUN:\s*process\.env\.STRIPE_WEBHOOK_FULFILLMENT_DRY_RUN/,
  },
  {
    name: 'Checkout session reloads product and variant data from Prisma',
    file: 'app/api/v1/checkout/session/route.ts',
    pattern: /prisma\.product\.findMany[\s\S]*prisma\.productVariant\.findMany/,
  },
  {
    name: 'Checkout metadata has local order and request reconciliation',
    file: 'app/api/v1/checkout/session/route.ts',
    pattern: /metadata:\s*{[\s\S]*local_order_id[\s\S]*idempotency_key[\s\S]*request_id[\s\S]*source:\s*'otakumori_checkout'/,
  },
];

let failures = 0;

for (const check of checks) {
  const source = readFileSync(check.file, 'utf8');
  if (check.pattern.test(source)) {
    console.log(`PASS ${check.name}`);
  } else {
    failures += 1;
    console.error(`FAIL ${check.name}`);
  }
}

if (failures > 0) {
  console.error(`Commerce release static checks failed: ${failures}`);
  process.exit(1);
}

console.log('Commerce release static checks passed');
